import { EventsManager } from "@/components/events-manager";
import prisma from "@/lib/prisma";

export default async function AdminEventsPage() {
  const events = await prisma.event
    .findMany({
      orderBy: {
        startDate: "asc",
      },
    })
    .catch(() => undefined);

  if (!events) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Begivenheder</h1>
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

  const serializedEvents = events.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
  }));

  return <EventsManager events={serializedEvents} />;
}
