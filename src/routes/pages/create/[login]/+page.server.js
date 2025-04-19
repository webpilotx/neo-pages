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

  // Fetch repositories for the account
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const repositories = response.ok ? await response.json() : [];

  // Fetch all accounts
  const accounts = await db.select().from(accountsTable);

  return { repositories, accounts, login };
}
