import prisma from "@/lib/prisma";

export default async function Home() {
  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const users = await prisma.user
    .findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    })
    .catch(() => undefined);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Next.js + Prisma 7
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Users from your database, loaded on the server.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          This page reads from <code className="text-zinc-800 dark:text-zinc-200">apps/web</code>{" "}
          using the Prisma client from{" "}
          <code className="text-zinc-800 dark:text-zinc-200">packages/db</code>.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Seeded users</h2>
          <span className="text-sm text-zinc-500">{users?.length ?? 0} total</span>
        </div>

        {!users ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Could not query users yet. Run{" "}
            <code className="text-zinc-800 dark:text-zinc-200">pnpm --filter @countdown/db db:migrate</code>
            , then{" "}
            <code className="text-zinc-800 dark:text-zinc-200">pnpm --filter @countdown/db db:seed</code>
            , then refresh.
          </p>
        ) : users.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No users yet. Run{" "}
            <code className="text-zinc-800 dark:text-zinc-200">pnpm --filter @countdown/db db:seed</code>{" "}
            after your first migration.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {user.name ?? "Unnamed user"}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                </div>
                <time
                  className="shrink-0 text-sm text-zinc-500"
                  dateTime={user.createdAt.toISOString()}
                >
                  {formatter.format(user.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
