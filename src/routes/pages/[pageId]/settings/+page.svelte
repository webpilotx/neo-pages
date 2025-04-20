<script>
  export let data;

  async function deletePage() {
    if (confirm("Are you sure you want to delete this page?")) {
      await fetch("/api/delete-page", {
        method: "POST",
        body: JSON.stringify({ pageId: data.page.id }),
      });
      window.location.href = "/pages";
    }
  }
</script>

<h1 class="text-2xl font-bold mb-4">Settings</h1>
<button
  on:click={deletePage}
  class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
>
  Delete Page
</button>
