import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export function triggerDeploymentWorker(deploymentId) {
  const logDir = path.resolve(`${process.cwd()}/logs`); // Use current working directory
  const logFilePath = path.join(logDir, `${deploymentId}.log`);

  // Ensure the log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Initialize the log file with a starting message
  fs.writeFileSync(
    logFilePath,
    `[${new Date().toISOString()}] Log initialized for deployment ID: ${deploymentId}\n`,
    { flag: "a" }
  );

  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  const worker = spawn("node", ["./workers/deploy.js", deploymentId], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"], // Capture stdout and stderr
  });

  // Stream logs to the log file
  worker.stdout.pipe(logStream);
  worker.stderr.pipe(logStream);

  worker.unref(); // Allow the worker to run independently
}
