<script>
  let logContent = "";

  async function streamLog() {
    if (typeof window === "undefined") return; // Ensure this runs only on the client side

    const response = await fetch(window.location.href);
    if (!response.body) {
      logContent = "Failed to stream log.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      logContent = decoder.decode(value);
    }
  }

  streamLog();
</script>

<h1 class="text-2xl font-bold mb-4">Deployment Log</h1>
<pre class="bg-gray-100 p-4 rounded overflow-auto">{logContent}</pre>
