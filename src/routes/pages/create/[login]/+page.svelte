<script>
  import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
  import { goto } from "$app/navigation";
  export let data;

  let repositories = data.repositories;
  let selectedRepo = null;
  let accounts = data.accounts; // List of all accounts
  let selectedLogin = data.login; // Currently selected login

  let currentPage = 1;
  const itemsPerPage = 6;

  function getPaginatedRepos() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return repositories.slice(start, end);
  }

  function nextPage() {
    if (currentPage * itemsPerPage < repositories.length) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function goToPage(page) {
    currentPage = page;
  }

  function changeLogin() {
    goto(`/pages/create/${selectedLogin}`);
  }

  const totalPages = Math.ceil(repositories.length / itemsPerPage);

  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${PUBLIC_GITHUB_CLIENT_ID}&scope=repo`;

  function beginSetup() {
    if (selectedRepo?.full_name) {
      const repoFullname = selectedRepo.full_name; // Use the full repository name from the selectedRepo
      goto(
        `/pages/create/${selectedLogin}/${encodeURIComponent(repoFullname)}`
      );
    } else {
      console.error("Selected repository information is missing.");
    }
  }
</script>

<h1 class="text-2xl font-bold mb-4">Select a Repository</h1>
<div class="mb-4">
  <label for="account-select" class="block text-sm font-medium text-gray-700"
    >Select Account:</label
  >
  <select
    id="account-select"
    bind:value={selectedLogin}
    on:change={changeLogin}
    class="mt-1 block w-full border-gray-300 rounded shadow-sm"
  >
    {#each accounts as account}
      <option value={account.login}>{account.login}</option>
    {/each}
  </select>
</div>
<a
  href={authorizeUrl}
  class="inline-block bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
>
  Authorize GitHub Access
</a>
<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  {#each getPaginatedRepos() as repo}
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
<div class="flex justify-between items-center mt-4">
  <button
    on:click={prevPage}
    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
    disabled={currentPage === 1}
  >
    Previous
  </button>
  <div class="flex space-x-2">
    {#each Array(totalPages)
      .fill(0)
      .map((_, i) => i + 1) as page}
      <button
        on:click={() => goToPage(page)}
        class="px-4 py-2 rounded {currentPage === page
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}"
      >
        {page}
      </button>
    {/each}
  </div>
  <button
    on:click={nextPage}
    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
    disabled={currentPage * itemsPerPage >= repositories.length}
  >
    Next
  </button>
</div>
<button
  on:click={beginSetup}
  class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
  disabled={!selectedRepo}
>
  Begin Setup
</button>
