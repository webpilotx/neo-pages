import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import {
  accountsTable,
  pagesTable,
  envsTable,
  deploymentsTable,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { triggerDeploymentWorker } from "$lib/server/deploymentWorker"; // Assume this is a utility to trigger the worker

export async function load({ params }) {
  const { login, repoFullname } = params;

  if (!login || !repoFullname) {
    throw error(400, "Missing login or repository information.");
  }

  const decodedRepoFullname = decodeURIComponent(repoFullname);

  // Fetch the account for the specified login
  const account = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.login, login))
    .limit(1);

  if (!account.length) {
    throw error(404, "Account not found.");
  }

  const accessToken = account[0].accessToken;

  // Fetch branches for the repository
  const branchesResponse = await fetch(
    `https://api.github.com/repos/${decodedRepoFullname}/branches`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!branchesResponse.ok) {
    throw error(500, "Failed to fetch branches for the repository.");
  }
  const branches = await branchesResponse.json();

  return {
    login,
    repoFullname: decodedRepoFullname,
    branches,
  };
}

export const actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const repo = params.repoFullname;
    const name = formData.get("name");
    const branch = formData.get("branch");
    const buildScript = formData.get("buildScript");
    const buildOutputDir = formData.get("buildOutputDir");
    const envVars = JSON.parse(formData.get("envVars"));

    // Insert the page into the database
    const [page] = await db
      .insert(pagesTable)
      .values({
        accountLogin: params.login,
        repo,
        name,
        branch,
        buildScript,
        buildOutputDir,
      })
      .returning({ id: pagesTable.id });

    // Insert environment variables into the database
    if (envVars.length > 0) {
      await db.insert(envsTable).values(
        envVars.map((env) => ({
          pageId: page.id,
          name: env.name,
          value: env.value,
        }))
      );
    }

    // Create a new deployment entry
    const [deployment] = await db
      .insert(deploymentsTable)
      .values({
        pageId: page.id,
      })
      .returning({ id: deploymentsTable.id });

    // Trigger the Node.js worker for deployment
    triggerDeploymentWorker(deployment.id);

    return { success: true };
  },
};
