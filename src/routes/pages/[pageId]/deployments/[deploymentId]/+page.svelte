<script>
  import { onMount } from "svelte";
  export let data;

  let logContent = data.logContent;

  async function fetchLog() {
    const response = await fetch(window.location.href);
    const updatedData = await response.json();
    logContent = updatedData.logContent;
  }

  onMount(() => {
    const interval = setInterval(fetchLog, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  });
</script>

<h1 class="text-2xl font-bold mb-4">Deployment Log</h1>
<pre class="bg-gray-100 p-4 rounded overflow-auto">{logContent}</pre>
