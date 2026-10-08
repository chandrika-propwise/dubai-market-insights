"use server";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth/policy";
export async function signIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    email.length > 320 ||
    password.length > 4096
  )
    redirect("/admin/login?reason=credentials");
  const client = await createAuthClient();
  if (!client) redirect("/admin/login?reason=setup");
  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) redirect("/admin/login?reason=credentials");
  const { data, error: userError } = await client.auth.getUser();
  if (userError || !data.user) redirect("/admin/login?reason=service");
  if (!isAdmin(data.user)) {
    await client.auth.signOut();
    redirect("/admin/login?reason=access");
  }
  redirect("/internal");
}
export async function signOut() {
  const client = await createAuthClient();
  if (client) await client.auth.signOut();
  redirect("/admin/login");
}
