<script>
  export let data;
  let pages = data.pages;
  let firstLogin = data.firstLogin; // First available accountsTable.login

  async function deletePage(id) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    pages = pages.filter((page) => page.id !== id);
  }
</script>

<h1 class="text-2xl font-bold mb-4">Manage Pages</h1>
<a
  href={`/pages/create/${firstLogin}`}
  class="inline-block bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
>
  Create New Page
</a>
<ul class="space-y-4">
  {#each pages as page}
    <li class="p-4 bg-white shadow rounded flex justify-between items-center">
      <div>
        <strong class="text-lg">{page.name}</strong>
        <p class="text-sm text-gray-600">{page.repo}/{page.branch}</p>
      </div>
      <button
        on:click={() => deletePage(page.id)}
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </li>
  {/each}
</ul>
