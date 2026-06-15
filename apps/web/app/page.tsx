import prisma from "@/lib/prisma";
import { Badge } from "@countdown/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";

type EventStatus = "upcoming" | "live" | "past";

type EventCountdown = {
  status: EventStatus;
  label: string;
};

const dateFormatter = new Intl.DateTimeFormat("da-DK", {
  dateStyle: "medium",
  timeStyle: "short",
});

const getEventCountdown = (
  startDate: Date,
  endDate: Date,
  now: Date,
): EventCountdown => {
  if (now > endDate) {
    return { status: "past", label: "Afsluttet" };
  }

  if (now >= startDate) {
    return { status: "live", label: "Live nu" };
  }

  const diffMs = startDate.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return {
      status: "upcoming",
      label: days === 1 ? `${days} dag` : `${days} dage`,
    };
  }

  return {
    status: "upcoming",
    label: hours === 1 ? `${hours} time` : `${hours} timer`,
  };
};

const statusVariant = (status: EventStatus): "default" | "secondary" | "outline" => {
  if (status === "live") {
    return "default";
  }

  if (status === "upcoming") {
    return "secondary";
  }

  return "outline";
};

export default async function Home() {
  const now = new Date();
  const events = await prisma.event
    .findMany({
      orderBy: {
        startDate: "asc",
      },
    })
    .catch(() => undefined);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Festivaltæller
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Næste i 2026</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Følg nedtællingen til Danmarks bedste festivaler — Roskilde, Distortion Ø, O Days og
          Karrusel.
        </p>
      </div>

      {!events ? (
        <Card>
          <CardHeader>
            <CardTitle>Databasen er ikke klar</CardTitle>
            <CardDescription>
              Kør{" "}
              <code className="text-foreground">pnpm --filter @countdown/db db:migrate</code>, derefter{" "}
              <code className="text-foreground">pnpm --filter @countdown/db db:seed</code>, og
              genindlæs siden.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingen begivenheder endnu</CardTitle>
            <CardDescription>
              Kør{" "}
              <code className="text-foreground">pnpm --filter @countdown/db db:seed</code> for at
              indlæse festivalerne i 2026.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4">
          {events.map((event) => {
            const countdown = getEventCountdown(event.startDate, event.endDate, now);

            return (
              <li key={event.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle>{event.name}</CardTitle>
                        {event.description ? (
                          <CardDescription>{event.description}</CardDescription>
                        ) : null}
                      </div>
                      <Badge variant={statusVariant(countdown.status)}>{countdown.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-1 text-sm text-muted-foreground">
                    <p>
                      Starter{" "}
                      <time
                        className="text-foreground"
                        dateTime={event.startDate.toISOString()}
                      >
                        {dateFormatter.format(event.startDate)}
                      </time>
                    </p>
                    <p>
                      Slutter{" "}
                      <time className="text-foreground" dateTime={event.endDate.toISOString()}>
                        {dateFormatter.format(event.endDate)}
                      </time>
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
