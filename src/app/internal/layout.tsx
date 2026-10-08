import { Shell } from "@/components/shell";
import { signOut } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <Shell isAdmin signOutAction={signOut}>
      {children}
    </Shell>
  );
}
