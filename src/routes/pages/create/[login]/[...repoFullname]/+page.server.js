import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { accountsTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ params }) {
  const { login, repoFullname } = params;

  if (!login || !repoFullname) {
    throw error(400, "Missing login or repository information.");
  }

  const decodedRepoFullname = decodeURIComponent(repoFullname);

  // Fetch the account for the specified login
  const account = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.login, login))
    .limit(1);

  if (!account.length) {
    throw error(404, "Account not found.");
  }

  const accessToken = account[0].accessToken;

  // Fetch branches for the repository
  const branchesResponse = await fetch(
    `https://api.github.com/repos/${decodedRepoFullname}/branches`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!branchesResponse.ok) {
    throw error(500, "Failed to fetch branches for the repository.");
  }
  const branches = await branchesResponse.json();

  return {
    login,
    repoFullname: decodedRepoFullname,
    branches,
  };
}
