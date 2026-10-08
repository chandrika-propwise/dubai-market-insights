"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";
function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Signing in…" : "Sign in to workspace"}
    </Button>
  );
}
export function LoginForm() {
  return (
    <form action={signIn} className="admin-login-form">
      <label htmlFor="admin-email">Email address</label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        maxLength={320}
      />
      <label htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={4096}
      />
      <Submit />
    </form>
  );
}
