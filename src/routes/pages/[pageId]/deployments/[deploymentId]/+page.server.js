import fs from "fs";
import path from "path";

export async function load({ params }) {
  const { deploymentId } = params;
  const logFilePath = path.resolve(
    `/var/www/neo-pages/logs/${deploymentId}.log`
  );

  if (!fs.existsSync(logFilePath)) {
    return { logContent: "Log file not found." };
  }

  const logContent = fs.readFileSync(logFilePath, "utf-8");
  return { logContent };
}
