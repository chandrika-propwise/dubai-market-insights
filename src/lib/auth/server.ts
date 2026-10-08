import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authConfig, authCookieOptions } from "./config";
import { isAdmin } from "./policy";
export async function createAuthClient() {
  const config = authConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        // Middleware refreshes sessions for page requests. Server actions can set cookies directly.
        try {
          for (const { name, value, options } of values)
            cookieStore.set(name, value, options);
        } catch {}
      },
    },
  });
}
export const requireAdmin = cache(async () => {
  const client = await createAuthClient();
  if (!client) redirect("/admin/login?reason=setup");
  // getUser verifies the session with Supabase; local cookies alone never grant access.
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  if (!isAdmin(data.user)) redirect("/admin/login?reason=access");
  return data.user;
});
