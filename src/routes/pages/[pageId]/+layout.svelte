<script>
  export let data;
</script>

<nav class="mt-4">
  <ul class="list-disc pl-5">
    <li>
      <a
        href={`/pages/${data.pageId}/edit`}
        class="text-blue-500 hover:underline"
      >
        Edit Page
      </a>
    </li>
    <li>
      <a
        href={`/pages/${data.pageId}/deployments`}
        class="text-blue-500 hover:underline"
      >
        Deployments
      </a>
    </li>
    <li>
      <a
        href={`/pages/${data.pageId}/settings`}
        class="text-blue-500 hover:underline"
      >
        Settings
      </a>
    </li>
  </ul>
</nav>

<slot />
