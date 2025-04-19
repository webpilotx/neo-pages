<script>
  import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
  import { goto } from "$app/navigation";
  export let data;
  let repositories = data.repositories;
  let selectedRepo = null;

  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${PUBLIC_GITHUB_CLIENT_ID}&scope=repo`;

  function beginSetup() {
    if (selectedRepo) {
      goto(`/pages/create/${selectedRepo.full_name}`);
    }
  }

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
<a
  href={authorizeUrl}
  class="inline-block bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
>
  Authorize GitHub Access
</a>
<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  {#each repositories as repo}
    <div
      class="p-4 bg-white shadow rounded cursor-pointer border-2 {selectedRepo?.id ===
      repo.id
        ? 'border-blue-500'
        : 'border-transparent'}"
      on:click={() => (selectedRepo = repo)}
    >
      <strong class="text-lg">{repo.name}</strong>
      <p class="text-sm text-gray-600">{repo.full_name}</p>
    </div>
  {/each}
</div>
<button
  on:click={beginSetup}
  class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
  disabled={!selectedRepo}
>
  Begin Setup
</button>
