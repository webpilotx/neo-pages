import { db } from "$lib/server/db";
import { pagesTable } from "$lib/server/db/schema";

export async function load() {
  const pages = await db.select().from(pagesTable);
  return { pages };
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
