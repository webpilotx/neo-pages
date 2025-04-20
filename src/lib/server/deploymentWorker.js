import { spawn } from "child_process";

export function triggerDeploymentWorker(deploymentId) {
  const worker = spawn("node", ["./workers/deploy.js", deploymentId], {
    detached: true,
    stdio: "ignore",
  });

  worker.unref(); // Allow the worker to run independently
}
