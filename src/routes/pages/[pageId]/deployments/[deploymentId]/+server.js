import fs from "fs";
import path from "path";

export async function GET({ params }) {
  const { deploymentId } = params;
  const logFilePath = path.resolve(`${process.cwd()}/logs/${deploymentId}.log`);

  if (!fs.existsSync(logFilePath)) {
    return new Response("Log file not found.", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const sendChunk = (chunk) => {
        if (!controller.closed) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      };

      // Read the initial content of the log file
      const initialContent = fs.readFileSync(logFilePath, "utf-8");
      sendChunk(initialContent);

      // Watch for changes to the log file
      const watcher = fs.watch(
        logFilePath,
        { encoding: "utf-8" },
        (eventType) => {
          if (eventType === "change") {
            const updatedContent = fs.readFileSync(logFilePath, "utf-8");
            sendChunk(updatedContent);
          }
        }
      );

      // Cleanup when the stream is closed
      controller.close = () => {
        watcher.close();
      };
    },
    cancel() {
      // Ensure the watcher is closed when the stream is canceled
      watcher.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
    },
  });
}
