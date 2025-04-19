import { db } from "$lib/server/db";
import { pagesTable, accountsTable } from "$lib/server/db/schema";

export async function load() {
  const pages = await db.select().from(pagesTable);
  const accounts = await db.select().from(accountsTable).limit(1); // Fetch the first account
  const firstLogin = accounts.length > 0 ? accounts[0].login : null;

  return { pages, firstLogin };
}
