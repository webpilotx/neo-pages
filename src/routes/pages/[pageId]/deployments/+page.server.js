import { db } from "$lib/server/db"; // Adjust the import path if necessary
import { deploymentsTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ params }) {
  const { pageId } = params;

  // Fetch deployments for the given pageId
  const deployments = await db
    .select()
    .from(deploymentsTable)
    .where(eq(deploymentsTable.pageId, pageId));

  return {
    deployments,
  };
}
