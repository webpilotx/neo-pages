import { db } from "$lib/server/db";
import { pagesTable, accountsTable } from "$lib/server/db/schema";

export async function actions({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const repo = formData.get("repo");
  const branch = formData.get("branch");
  const buildScript = formData.get("buildScript");
  const buildOutputDir = formData.get("buildOutputDir");

  await db.insert(pagesTable).values({
    name,
    repo,
    branch,
    buildScript,
    buildOutputDir,
  });

  return { success: true };
}

export async function load() {
  const accounts = await db.select().from(accountsTable);
  const repositories = [];

  for (const account of accounts) {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    });
    if (response.ok) {
      const repos = await response.json();
      repositories.push(
        ...repos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          clone_url: repo.clone_url,
        }))
      );
    }
  }

  return { repositories };
}
