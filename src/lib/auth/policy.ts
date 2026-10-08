/** Only server-controlled app metadata grants access. User-editable metadata is ignored. */
export function isAdmin(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
): boolean {
  return user?.app_metadata?.role === "admin";
}
