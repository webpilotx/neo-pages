import { db } from "$lib/server/db"; // Adjust the import path as necessary
import { pagesTable } from "$lib/server/db/schema"; // Import the schema
import { eq } from "drizzle-orm"; // Import the equality operator

export async function load({ params }) {
  // Fetch the page data from the pagesTable
  const page = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.id, parseInt(params.pageId)))
    .get();

  if (!page) {
    throw new Error(`Page with ID ${params.pageId} not found`);
  }

  return {
    page,
  };
}
