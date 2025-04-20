import "dotenv/config"; // Load environment variables
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../src/lib/server/db/schema.js"; // Import only the schema
const { deploymentsTable, pagesTable, envsTable } = schema; // Destructure the tables from the schema
import { eq } from "drizzle-orm";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const client = new Database(process.env.DATABASE_URL);

const db = drizzle(client, { schema });

const deploymentId = process.argv[2];

if (!deploymentId) {
  console.error("Deployment ID is required.");
  process.exit(1);
}

(async () => {
  const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
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
    const baseDir = path.resolve(`${process.cwd()}/pages`);
    const repoDir = path.join(baseDir, `${page.id}`);

    const execWithLogging = (command, options = {}) => {
      log(`Executing: ${command}`);
      execSync(command, {
        stdio: "inherit",
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
    sqlite.close(); // Close the SQLite database connection
  }
})();
