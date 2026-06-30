import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { getSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
