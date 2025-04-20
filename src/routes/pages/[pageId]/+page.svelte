<script>
  export let data;
</script>

<h1 class="text-2xl font-bold mb-4">Page: {data.page.name}</h1>
<p>Repository: {data.page.repo}</p>
<p>Branch: {data.page.branch}</p>

<form method="post" action="?/deploy">
  <button
    type="submit"
    class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
  >
    Trigger Deploy
  </button>
</form>
