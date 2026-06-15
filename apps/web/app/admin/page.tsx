import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
    </main>
  );
}
