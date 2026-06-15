import { UsersManager } from "@/components/users-manager";
import prisma from "@/lib/prisma";

export default async function AdminBrugerePage() {
  const users = await prisma.user
    .findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        password: true,
      },
    })
    .catch(() => undefined);

  if (!users) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Brugere</h1>
        <p className="text-sm text-muted-foreground">
          Databasen er ikke klar. Kør{" "}
          <code className="text-foreground">
            pnpm --filter @countdown/db db:migrate
          </code>
          .
        </p>
      </div>
    );
  }

  const serializedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    hasPassword: user.password !== null,
  }));

  return <UsersManager users={serializedUsers} />;
}
