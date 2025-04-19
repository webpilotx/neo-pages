<script>
  import "../app.css";

  let { children } = $props();
</script>

<div class="min-h-screen bg-gray-100 text-gray-800">
  <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
    <h1 class="text-lg font-bold">
      <a href="/pages" class="hover:underline">Pages</a>
    </h1>
  </header>
  <main class="p-6">
    {@render children()}
  </main>
  <footer class="bg-gray-800 text-white text-center p-4">
    <p>&copy; 2025 Pages</p>
  </footer>
</div>
