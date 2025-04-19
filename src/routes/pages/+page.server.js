import { db } from "$lib/server/db"; // Adjust the import path if needed
import { pagesTable } from "$lib/server/db/schema";

export async function load() {
  const pages = await db.select().from(pagesTable);
  return { pages };
}
