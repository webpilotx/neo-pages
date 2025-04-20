import { db } from "$lib/server/db";
import { accountsTable, pagesTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load() {
  const pages = await db.select().from(pagesTable);
  const accounts = await db.select().from(accountsTable).limit(1); // Fetch the first account
  const firstLogin = accounts.length > 0 ? accounts[0].login : null;

  return { pages, firstLogin };
}

export const actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const pageId = formData.get("pageId");

    if (!pageId) {
      throw error(400, "Missing page ID.");
    }

    // Delete the page from the database
    await db.delete(pagesTable).where(eq(pagesTable.id, pageId));

    return { success: true };
  },
};
