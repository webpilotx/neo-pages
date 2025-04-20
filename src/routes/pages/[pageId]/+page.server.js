import { db } from "$lib/server/db"; // Adjust the import path as necessary
import { pagesTable, deploymentsTable } from "$lib/server/db/schema"; // Import the schema
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm"; // Import the equality operator
import { triggerDeploymentWorker } from "$lib/server/deploymentWorker"; // Import the deployment worker

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

  return { page };
}

export const actions = {
  deploy: async ({ params }) => {
    const pageId = parseInt(params.pageId);

    // Insert a new deployment record into the deploymentsTable
    const [deployment] = await db
      .insert(deploymentsTable)
      .values({ pageId })
      .returning();

    if (!deployment) {
      throw new Error("Failed to create deployment record");
    }

    // Trigger the deployment worker
    triggerDeploymentWorker(deployment.id);

    // Redirect to the deployment details page
    throw redirect(303, `/pages/${pageId}/deployments/${deployment.id}`);
  },
};
