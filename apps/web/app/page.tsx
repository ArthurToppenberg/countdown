import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@countdown/ui/components/badge";
import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";

type EventStatus = "upcoming" | "live" | "past";

type EventCountdown = {
  status: EventStatus;
  label: string;
};

type FestivalEvent = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
};

type TimelineEventItem = {
  kind: "event";
  event: FestivalEvent;
};

type TimelineTodayItem = {
  kind: "today";
  date: Date;
};

type TimelineItem = TimelineEventItem | TimelineTodayItem;

const getItemDate = (item: TimelineItem): Date =>
  item.kind === "today" ? item.date : item.event.startDate;

const buildTimelineItems = (events: FestivalEvent[], now: Date): TimelineItem[] => {
  const items: TimelineItem[] = [];
  let todayInserted = false;

  for (const event of events) {
    if (!todayInserted && now < event.startDate) {
      items.push({ kind: "today", date: now });
      todayInserted = true;
    }

    items.push({ kind: "event", event });
  }

  if (!todayInserted) {
    items.push({ kind: "today", date: now });
  }

  return items;
};

const shortMonthFormatter = new Intl.DateTimeFormat("da-DK", {
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
});

const dayMonthFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("da-DK", {
  month: "long",
  year: "numeric",
});

const getMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}`;

const formatDateRange = (startDate: Date, endDate: Date): string => {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${dayFormatter.format(startDate)}.–${dayFormatter.format(endDate)}. ${shortMonthFormatter.format(startDate)} ${startDate.getFullYear()}`;
  }

  if (sameYear) {
    return `${dayMonthFormatter.format(startDate)} – ${dayMonthFormatter.format(endDate)} ${startDate.getFullYear()}`;
  }

  return `${fullDateFormatter.format(startDate)} – ${fullDateFormatter.format(endDate)}`;
};

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

const statusDotClassName = (status: EventStatus): string => {
  if (status === "live") {
    return "bg-primary ring-4 ring-primary/20";
  }

  if (status === "upcoming") {
    return "bg-foreground/80 ring-4 ring-background";
  }

  return "bg-muted-foreground/50 ring-4 ring-background";
};

const statusCardClassName = (status: EventStatus): string => {
  if (status === "live") {
    return "ring-primary/30";
  }

  if (status === "past") {
    return "opacity-60";
  }

  return "";
};

export default async function Home() {
  const session = await getSession();
  const now = new Date();
  const events = await prisma.event
    .findMany({
      orderBy: {
        startDate: "asc",
      },
    })
    .catch(() => undefined);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-16">
      <div className="mb-12">
        <div className="mb-2 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Festivaltæller
          </p>
          {session ? (
            <LogoutButton email={session.email} role={session.role} />
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline">
                Log ind
              </Button>
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Tidslinje 2026</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Følg festivalåret kronologisk — fra Distortion Ø til Karrusel.
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
        <div className="relative">
          <div
            className="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-border"
            aria-hidden
          />

          <ol className="flex flex-col gap-10">
            {buildTimelineItems(events, now).map((item, index, timelineItems) => {
              const previousItem = index > 0 ? timelineItems[index - 1] : undefined;
              const itemDate = getItemDate(item);
              const showMonthHeader =
                !previousItem ||
                getMonthKey(getItemDate(previousItem)) !== getMonthKey(itemDate);

              if (item.kind === "today") {
                return (
                  <li key="today" className="flex flex-col gap-6">
                    {showMonthHeader ? (
                      <div className="relative grid grid-cols-[1.375rem_1fr] items-center gap-x-5">
                        <div className="flex justify-center">
                          <span className="z-10 size-2 rounded-full bg-border" aria-hidden />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {monthYearFormatter.format(item.date)}
                        </p>
                      </div>
                    ) : null}

                    <div className="relative grid grid-cols-[1.375rem_1fr] gap-x-5">
                      <div className="flex justify-center pt-3">
                        <span
                          className="z-10 size-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/25"
                          aria-hidden
                        />
                      </div>

                      <div className="relative min-w-0">
                        <div
                          className="absolute top-3 -left-5 h-px w-5 bg-primary/40"
                          aria-hidden
                        />
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
                          <p className="text-sm font-medium">I dag</p>
                          <time
                            className="text-sm text-muted-foreground"
                            dateTime={item.date.toISOString()}
                          >
                            {fullDateFormatter.format(item.date)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              }

              const event = item.event;
              const countdown = getEventCountdown(event.startDate, event.endDate, now);

              return (
                <li key={event.id} className="flex flex-col gap-6">
                  {showMonthHeader ? (
                    <div className="relative grid grid-cols-[1.375rem_1fr] items-center gap-x-5">
                      <div className="flex justify-center">
                        <span className="z-10 size-2 rounded-full bg-border" aria-hidden />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {monthYearFormatter.format(event.startDate)}
                      </p>
                    </div>
                  ) : null}

                  <div className="relative grid grid-cols-[1.375rem_1fr] gap-x-5">
                    <div className="flex justify-center pt-5">
                      <span
                        className={`z-10 size-2.5 shrink-0 rounded-full ${statusDotClassName(countdown.status)}`}
                        aria-hidden
                      />
                    </div>

                    <div className="relative min-w-0">
                      <div
                        className="absolute top-[1.375rem] -left-5 h-px w-5 bg-border"
                        aria-hidden
                      />
                      <Card className={statusCardClassName(countdown.status)}>
                        <CardHeader>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <time dateTime={event.startDate.toISOString()}>
                              {formatDateRange(event.startDate, event.endDate)}
                            </time>
                            {event.description ? (
                              <span className="mt-1.5 block">{event.description}</span>
                            ) : null}
                          </CardDescription>
                          <CardAction>
                            <Badge variant={statusVariant(countdown.status)}>
                              {countdown.label}
                            </Badge>
                          </CardAction>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </main>
  );
}
