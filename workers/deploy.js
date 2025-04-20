import { db } from "../src/lib/server/db";
import {
  deploymentsTable,
  pagesTable,
  envsTable,
} from "../src/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const deploymentId = process.argv[2];

if (!deploymentId) {
  console.error("Deployment ID is required.");
  process.exit(1);
}

(async () => {
  const logDir = path.resolve(`/var/www/neo-pages/logs`);
  const logFilePath = path.join(logDir, `${deploymentId}.log`);

  // Ensure the log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  const log = (message) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${message}\n`);
    console.log(message);
  };

  try {
    log(`Starting deployment process for deployment ID: ${deploymentId}`);

    // Fetch deployment details
    const [deployment] = await db
      .select()
      .from(deploymentsTable)
      .where(eq(deploymentsTable.id, deploymentId));

    if (!deployment) {
      log("Deployment not found.");
      process.exit(1);
    }

    // Fetch page details
    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, deployment.pageId));

    if (!page) {
      log("Page not found.");
      process.exit(1);
    }

    // Fetch environment variables
    const envVars = await db
      .select()
      .from(envsTable)
      .where(eq(envsTable.pageId, page.id));

    const repoUrl = `https://${page.accessToken}@github.com/${page.repo}`;
    const baseDir = path.resolve(`/var/www/neo-pages/pages`);
    const repoDir = path.join(baseDir, `${page.id}`); // Simplified path to use only page ID

    // Ensure the base directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      log(`Created base directory: ${baseDir}`);
    }

    const execWithLogging = (command, options = {}) => {
      log(`Executing: ${command}`);
      execSync(command, {
        stdio: ["ignore", logStream, logStream], // Redirect stdout and stderr to the log stream
        ...options,
      });
    };

    // Clone or pull the repository
    if (!fs.existsSync(repoDir)) {
      log(`Cloning repository: ${repoUrl} (branch: ${page.branch})`);
      execWithLogging(
        `git clone --branch ${page.branch} ${repoUrl} ${repoDir}`
      );
    } else {
      log(`Pulling latest changes for repository: ${repoUrl}`);
      execWithLogging(`git -C ${repoDir} reset --hard`);
      execWithLogging(`git -C ${repoDir} checkout ${page.branch}`);
      execWithLogging(`git -C ${repoDir} pull origin ${page.branch}`);
    }

    // Ensure the correct branch is checked out
    log(`Checking out branch: ${page.branch}`);
    execWithLogging(`git -C ${repoDir} checkout ${page.branch}`);
    execWithLogging(`git -C ${repoDir} pull origin ${page.branch}`);

    // Write environment variables to .env file
    const envFilePath = path.join(repoDir, ".env");
    const envFileContent = envVars
      .map((env) => `${env.name}=${env.value}`)
      .join("\n");
    fs.writeFileSync(envFilePath, envFileContent);
    log(`Environment variables written to ${envFilePath}`);

    // Run the build script
    if (page.buildScript) {
      log(`Running build script: ${page.buildScript}`);
      execWithLogging(page.buildScript, { cwd: repoDir });
    }

    // Determine the Node.js binary path
    const nodeBinary = process.execPath;

    // Determine the working directory for the service
    const workingDir = page.buildOutputDir
      ? path.join(repoDir, page.buildOutputDir)
      : repoDir;

    // Write systemd service file
    const serviceFilePath = `${process.env.HOME}/.config/systemd/user/${page.name}-${page.id}.service`; // Include page.id for uniqueness
    const envVarsContent = envVars
      .map((env) => `Environment="${env.name}=${env.value}"`)
      .join("\n");
    const serviceFileContent = `
[Unit]
Description=Service for ${page.name}
After=network.target

[Service]
Type=simple
WorkingDirectory=${repoDir} // Always use repoDir
ExecStart=${nodeBinary} ${workingDir}/index.js
Restart=always
${envVarsContent}

[Install]
WantedBy=default.target
    `;
    fs.mkdirSync(path.dirname(serviceFilePath), { recursive: true }); // Ensure the directory exists
    fs.writeFileSync(serviceFilePath, serviceFileContent);
    log(`Systemd service file written to ${serviceFilePath}`);

    // Reload systemd and restart the service at --user level
    execWithLogging("systemctl --user daemon-reload");
    execWithLogging(`systemctl --user restart ${page.name}-${page.id}.service`);
    execWithLogging(`systemctl --user enable ${page.name}-${page.id}.service`);
    log(`Service ${page.name}-${page.id} restarted and enabled successfully.`);

    // Update deployment status to success
    await db
      .update(deploymentsTable)
      .set({ completedAt: new Date().toISOString(), exitCode: 0 })
      .where(eq(deploymentsTable.id, deploymentId));

    log("Deployment completed successfully.");
  } catch (error) {
    log(`Deployment failed: ${error.message}`);

    // Update deployment with failure
    await db
      .update(deploymentsTable)
      .set({ completedAt: new Date().toISOString(), exitCode: 1 })
      .where(eq(deploymentsTable.id, deploymentId));

    process.exit(1);
  } finally {
    logStream.end();
  }
})();
