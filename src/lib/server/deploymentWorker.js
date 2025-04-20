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

  // Function to log deployment stages
  const logStage = (stage) => {
    fs.writeFileSync(
      logFilePath,
      `[${new Date().toISOString()}] Deployment stage: ${stage}\n`,
      { flag: "a" }
    );
  };

  // Log the starting stage
  logStage("Deployment process started");

  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  const worker = spawn("node", ["./workers/deploy.js", deploymentId], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"], // Capture stdout and stderr
  });

  // Stream logs to the log file
  worker.stdout.pipe(logStream);
  worker.stderr.pipe(logStream);

  worker.on("close", (code) => {
    // Log the completed stage
    const stage =
      code === 0
        ? "Deployment process completed successfully"
        : "Deployment process completed with errors";
    logStage(stage);
  });

  worker.unref(); // Allow the worker to run independently
}
