<script>
  export let data;

  let login = data.login;
  let repoFullname = data.repoFullname;
  let pageName = repoFullname.split("/")[1];
  let branches = data.branches;
  let branch = branches.length > 0 ? branches[0].name : "";
  let buildScript = "";
  let buildOutputDir = "";
  let envVars = [{ name: "", value: "" }];

  function addEnvVar() {
    envVars.push({ name: "", value: "" });
  }

  function removeEnvVar(index) {
    envVars.splice(index, 1);
  }

  async function createAndDeploy() {
    await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo: repoFullname,
        name: pageName,
        branch,
        buildScript,
        buildOutputDir,
        envVars,
      }),
    });
    goto("/pages");
  }
</script>

<h1 class="text-2xl font-bold mb-4">Setup Page for {repoFullname}</h1>
<form on:submit|preventDefault={createAndDeploy} class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700">Page Name:</label>
    <input
      type="text"
      bind:value={pageName}
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700">Branch:</label>
    <select
      bind:value={branch}
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    >
      {#each branches as branchOption}
        <option value={branchOption.name}>{branchOption.name}</option>
      {/each}
    </select>
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700">Build Script:</label>
    <textarea
      bind:value={buildScript}
      rows="4"
      placeholder="e.g., npm run build"
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    ></textarea>
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700"
      >Build Output Directory:</label
    >
    <input
      type="text"
      bind:value={buildOutputDir}
      placeholder="e.g., dist/"
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700"
      >Environment Variables:</label
    >
    {#each envVars as env, index}
      <div class="flex space-x-2 mt-2">
        <input
          type="text"
          placeholder="Name"
          bind:value={env.name}
          class="flex-1 border-gray-300 rounded shadow-sm"
        />
        <input
          type="text"
          placeholder="Value"
          bind:value={env.value}
          class="flex-1 border-gray-300 rounded shadow-sm"
        />
        <button
          type="button"
          on:click={() => removeEnvVar(index)}
          class="bg-red-500 text-white px-2 rounded hover:bg-red-600"
        >
          Remove
        </button>
      </div>
    {/each}
    <button
      type="button"
      on:click={addEnvVar}
      class="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Add Variable
    </button>
  </div>
  <button
    type="submit"
    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Create and Deploy
  </button>
</form>
