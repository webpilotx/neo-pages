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

  await Promise.all(
    accounts.map(async (account) => {
      // Fetch user repositories
      const userReposResponse = await fetch(
        "https://api.github.com/user/repos",
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
        }
      );
      if (userReposResponse.ok) {
        const userRepos = await userReposResponse.json();
        repositories.push(
          ...userRepos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            clone_url: repo.clone_url,
          }))
        );
      }

      // Fetch organizations
      const orgsResponse = await fetch("https://api.github.com/user/orgs", {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });
      if (orgsResponse.ok) {
        const orgs = await orgsResponse.json();

        // Fetch repositories for each organization
        await Promise.all(
          orgs.map(async (org) => {
            const orgReposResponse = await fetch(
              `https://api.github.com/orgs/${org.login}/repos`,
              {
                headers: {
                  Authorization: `Bearer ${account.accessToken}`,
                },
              }
            );
            if (orgReposResponse.ok) {
              const orgRepos = await orgReposResponse.json();
              repositories.push(
                ...orgRepos.map((repo) => ({
                  id: repo.id,
                  name: repo.name,
                  full_name: repo.full_name,
                  clone_url: repo.clone_url,
                }))
              );
            }
          })
        );
      }
    })
  );

  return { repositories };
}
