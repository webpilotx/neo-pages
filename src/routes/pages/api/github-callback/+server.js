import { json, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { accountsTable } from "$lib/server/db/schema";
import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";

export async function GET({ url }) {
  const code = url.searchParams.get("code");
  if (!code) {
    return json({ error: "Missing code parameter" }, { status: 400 });
  }

  // Exchange the code for an access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: PUBLIC_GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  if (!tokenResponse.ok) {
    return json({ error: "Failed to fetch access token" }, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return json({ error: "Missing access token" }, { status: 500 });
  }

  // Fetch user information from GitHub
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    return json({ error: "Failed to fetch user information" }, { status: 500 });
  }

  const userData = await userResponse.json();
  const login = userData.login;

  if (!login) {
    return json({ error: "Missing user login" }, { status: 500 });
  }

  // Store the access token in the database
  await db
    .insert(accountsTable)
    .values({ login, accessToken })
    .onConflictDoUpdate({
      target: accountsTable.login,
      set: { accessToken },
    });

  // Redirect back to the /pages/create route
  throw redirect(302, "/pages/create");
}
