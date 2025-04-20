<script>
  import { enhance } from "$app/forms";
  export let data;
  export const pages = []; // Converted to a constant if needed externally

  let login = data.login;
  let repoFullname = data.repoFullname;
  let pageName = repoFullname.split("/")[1];
  let branches = data.branches;
  let branch = branches.length > 0 ? branches[0].name : "";
  let buildScript = "";
  let buildOutputDir = "";
  let envVars = []; // Default to 0 environment variables

  function addEnvVar() {
    envVars = [...envVars, { name: "", value: "" }]; // Ensure reactivity by creating a new array
  }

  function removeEnvVar(index) {
    envVars = envVars.filter((_, i) => i !== index); // Ensure reactivity by creating a new array
  }
</script>

<h1 class="text-2xl font-bold mb-4">Setup Page for {repoFullname}</h1>
<form method="POST" use:enhance class="space-y-4">
  <div>
    <label for="page-name" class="block text-sm font-medium text-gray-700"
      >Page Name:</label
    >
    <input
      id="page-name"
      name="name"
      type="text"
      bind:value={pageName}
      required
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    />
  </div>
  <div>
    <label for="branch-select" class="block text-sm font-medium text-gray-700"
      >Branch:</label
    >
    <select
      id="branch-select"
      name="branch"
      bind:value={branch}
      required
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    >
      {#each branches as branchOption}
        <option value={branchOption.name}>{branchOption.name}</option>
      {/each}
    </select>
  </div>
  <div>
    <label for="build-script" class="block text-sm font-medium text-gray-700"
      >Build Script:</label
    >
    <textarea
      id="build-script"
      name="buildScript"
      bind:value={buildScript}
      rows="4"
      placeholder="e.g., npm run build"
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    ></textarea>
  </div>
  <div>
    <label
      for="build-output-dir"
      class="block text-sm font-medium text-gray-700"
      >Build Output Directory:</label
    >
    <input
      id="build-output-dir"
      name="buildOutputDir"
      type="text"
      bind:value={buildOutputDir}
      placeholder="e.g., dist/"
      class="mt-1 block w-full border-gray-300 rounded shadow-sm"
    />
  </div>
  <div>
    <label for="env-vars-group" class="block text-sm font-medium text-gray-700"
      >Environment Variables:</label
    >
    <div id="env-vars-group">
      {#each envVars as env, index}
        <div class="flex space-x-2 mt-2">
          <label for={`env-name-${index}`} class="sr-only">Name</label>
          <input
            id={`env-name-${index}`}
            type="text"
            name={`envVars[${index}][name]`}
            placeholder="Name"
            bind:value={env.name}
            required
            class="flex-1 border-gray-300 rounded shadow-sm"
          />
          <label for={`env-value-${index}`} class="sr-only">Value</label>
          <input
            id={`env-value-${index}`}
            type="password"
            name={`envVars[${index}][value}`}
            placeholder="Value"
            bind:value={env.value}
            required
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
  </div>
  <input type="hidden" name="envVars" value={JSON.stringify(envVars)} />
  <button
    type="submit"
    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Create and Deploy
  </button>
</form>
