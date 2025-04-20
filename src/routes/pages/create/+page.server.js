import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { accountsTable } from "$lib/server/db/schema";

export async function load() {
  const accounts = await db.select().from(accountsTable).limit(1); // Fetch the first account
  if (accounts.length > 0) {
    const firstLogin = accounts[0].login;
    throw redirect(302, `/pages/create/${firstLogin}`);
  } else {
    throw redirect(302, "/pages"); // Redirect back to /pages if no accounts exist
  }
}
