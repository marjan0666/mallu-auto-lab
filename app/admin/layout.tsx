import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";

// Middleware already gates /admin, but re-check here too: layouts render
// even when middleware config's matcher misses an edge case (e.g. static
// export tooling), so this is the last line of defense against a
// non-admin reaching admin server actions.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/login?next=/admin");

  return (
    <div className="container-page flex gap-8 py-10">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
