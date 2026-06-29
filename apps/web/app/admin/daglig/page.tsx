import { getActiveEvent } from "@/lib/active-event";
import { DagligManager } from "@/components/daglig-manager";
import { type DagligEmailEventProps } from "@countdown/email";
import { getSession } from "@/lib/auth";
import {
  buildDagligEmailProps,
  getDagligEmailSubject,
  renderDagligEmailHtml,
} from "@/lib/email/daglig-email";
import prisma from "@/lib/prisma";

export default async function AdminDagligPage() {
  const session = await getSession();

  const [users, emailProps, adminUser, activeEvent] = await Promise.all([
    prisma.user
      .findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
      .catch(() => undefined),
    buildDagligEmailProps(),
    session
      ? prisma.user.findUnique({
          where: { id: session.userId },
          select: { name: true },
        })
      : Promise.resolve(null),
    getActiveEvent().catch(() => undefined),
  ]);

  if (!users) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Daglig</h1>
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

  const previewName = adminUser?.name?.trim();
  const previewProps: (DagligEmailEventProps & { name: string }) | null =
    emailProps && previewName
      ? { ...emailProps, name: previewName }
      : null;
  const previewHtml = previewProps
    ? await renderDagligEmailHtml(previewProps)
    : null;
  const subject = previewProps
    ? getDagligEmailSubject(previewProps)
    : null;

  return (
    <DagligManager
      canSendEmail={emailProps !== undefined && activeEvent === undefined}
      previewHtml={previewHtml}
      subject={subject}
      users={users}
    />
  );
}
