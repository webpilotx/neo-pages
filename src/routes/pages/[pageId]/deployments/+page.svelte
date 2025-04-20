<script>
  export let data;
  const deployments = data.deployments;
</script>

<h1 class="text-2xl font-bold mb-4">Deployments</h1>
<ul>
  {#each deployments as deployment}
    <li>
      <a
        href={`./deployments/${deployment.id}`}
        class="text-blue-500 hover:underline"
      >
        Deployment #{deployment.id}
      </a>
    </li>
  {/each}
</ul>
