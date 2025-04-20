<script>
  export let data;
</script>

<h1 class="text-2xl font-bold mb-4">Page: {data.page.name}</h1>
<p>Repository: {data.page.repo}</p>
<p>Branch: {data.page.branch}</p>

<nav class="mt-4">
  <ul class="list-disc pl-5">
    <li>
      <a href="./{data.page.id}/edit" class="text-blue-500 hover:underline">
        Edit Page
      </a>
    </li>
    <li>
      <a
        href="./{data.page.id}/deployments"
        class="text-blue-500 hover:underline"
      >
        Deployments
      </a>
    </li>
    <li>
      <a href="./{data.page.id}/settings" class="text-blue-500 hover:underline">
        Settings
      </a>
    </li>
  </ul>
</nav>
