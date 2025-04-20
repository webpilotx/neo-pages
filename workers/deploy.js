import { db } from "../src/lib/server/db";
import {
  deploymentsTable,
  pagesTable,
  envsTable,
} from "../src/lib/server/db/schema";
import { eq } from "drizzle-orm";

const deploymentId = process.argv[2];

if (!deploymentId) {
  console.error("Deployment ID is required.");
  process.exit(1);
}

(async () => {
  try {
    // Fetch deployment details
    const [deployment] = await db
      .select()
      .from(deploymentsTable)
      .where(eq(deploymentsTable.id, deploymentId));

    if (!deployment) {
      console.error("Deployment not found.");
      process.exit(1);
    }

    // Fetch page details
    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, deployment.pageId));

    if (!page) {
      console.error("Page not found.");
      process.exit(1);
    }

    // Fetch environment variables
    const envVars = await db
      .select()
      .from(envsTable)
      .where(eq(envsTable.pageId, page.id));

    // Simulate deployment process
    console.log(`Deploying page: ${page.name}`);
    console.log(`Branch: ${page.branch}`);
    console.log(`Build Script: ${page.buildScript}`);
    console.log(`Environment Variables:`, envVars);

    // Simulate success
    await db
      .update(deploymentsTable)
      .set({ completedAt: new Date().toISOString(), exitCode: 0 })
      .where(eq(deploymentsTable.id, deploymentId));

    console.log("Deployment completed successfully.");
  } catch (error) {
    console.error("Deployment failed:", error);

    // Update deployment with failure
    await db
      .update(deploymentsTable)
      .set({ completedAt: new Date().toISOString(), exitCode: 1 })
      .where(eq(deploymentsTable.id, deploymentId));

    process.exit(1);
  }
})();
