import assert from "node:assert/strict";
import test from "node:test";
import { isAdmin } from "../src/lib/auth/policy";
test("only the server-controlled admin role grants access", () => {
  assert.equal(isAdmin({ app_metadata: { role: "admin" } }), true);
  for (const user of [
    null,
    undefined,
    {},
    { app_metadata: {} },
    { app_metadata: { role: "analyst" } },
    { app_metadata: { role: "editor" } },
    { app_metadata: { role: "Admin" } },
  ])
    assert.equal(isAdmin(user), false);
});
test("user-editable metadata cannot promote an account", () => {
  const spoofed = {
    app_metadata: { role: "analyst" },
    user_metadata: { role: "admin", is_admin: true },
  };
  assert.equal(isAdmin(spoofed), false);
  assert.equal(
    isAdmin({ user_metadata: { role: "admin" } } as {
      app_metadata?: Record<string, unknown>;
    }),
    false,
  );
});
