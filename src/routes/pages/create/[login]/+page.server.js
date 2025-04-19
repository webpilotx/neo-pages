import { db } from "$lib/server/db";
import { accountsTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ params }) {
  const login = params.login;

  // Fetch the account for the specified login
  const account = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.login, login))
    .limit(1);

  if (!account.length) {
    return { repositories: [], accounts: [] };
  }

  const accessToken = account[0].accessToken;

  const repositories = [];

  // Fetch user repositories
  const userReposResponse = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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
      Authorization: `Bearer ${accessToken}`,
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
              Authorization: `Bearer ${accessToken}`,
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

  // Fetch all accounts
  const accounts = await db.select().from(accountsTable);

  return { repositories, accounts, login };
}
