<script>
  export let data;
  let repositories = data.repositories;

  async function selectRepo(repo) {
    await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(repo),
    });
    window.location.href = "/pages";
  }
</script>

<h1 class="text-2xl font-bold mb-4">Select a Repository</h1>
<ul class="space-y-4">
  {#each repositories as repo}
    <li class="p-4 bg-white shadow rounded flex justify-between items-center">
      <div>
        <strong class="text-lg">{repo.name}</strong>
        <p class="text-sm text-gray-600">{repo.full_name}</p>
      </div>
      <button
        on:click={() => selectRepo(repo)}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Select
      </button>
    </li>
  {/each}
</ul>
