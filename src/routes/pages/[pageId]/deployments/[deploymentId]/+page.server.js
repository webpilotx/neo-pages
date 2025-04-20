import fs from "fs";
import path from "path";

export async function load({ params }) {
  const { deploymentId } = params;
  const logFilePath = path.resolve(
    `${process.cwd()}/logs/${deploymentId}.log` // Use current working directory
  );

  if (!fs.existsSync(logFilePath)) {
    return { logContent: "Log file not found." };
  }

  const logContent = fs.readFileSync(logFilePath, "utf-8");
  return { logContent };
}
