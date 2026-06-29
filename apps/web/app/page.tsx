import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { getSession } from "@/lib/auth";
import {
  type EventStatus,
  getEventCountdown,
} from "@/lib/event-countdown";
import {
  getMinigamePointsLeaderboard,
  getTodaysMinigameScore,
} from "@/lib/minigame/daily-minigame";
import { getOrCreateTodaysDailyMinigame } from "@/lib/minigame/daily-minigame-round";
import prisma from "@/lib/prisma";
import { getMinigame } from "@countdown/minigame";
import { Badge } from "@countdown/ui/components/badge";
import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";

type FestivalEvent = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
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
  const [events, leaderboard, todaysScore] = await Promise.all([
    prisma.event
      .findMany({
        orderBy: {
          startDate: "asc",
        },
      })
      .catch(() => undefined),
    getMinigamePointsLeaderboard(10).catch(() => undefined),
    session
      ? getTodaysMinigameScore(session.userId).catch(() => undefined)
      : Promise.resolve(null),
  ]);
  const hasPlayedTodaysGame = Boolean(todaysScore);
  const canPlayOfficialMinigame = !hasPlayedTodaysGame;
  const todaysRound =
    canPlayOfficialMinigame && session
      ? await getOrCreateTodaysDailyMinigame().catch(() => undefined)
      : undefined;
  const todaysGame = todaysRound
    ? getMinigame(todaysRound.gameId)
    : undefined;

  return (
    <>
      <video
        aria-hidden
        autoPlay
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover grayscale"
        loop
        muted
        playsInline
        preload="auto"
        src="/background.mp4"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-background/80"
      />
      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-8 pb-16">
        <div className="mb-12">
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Festivaltæller
            </p>
            {session ? (
              <LogoutButton
                email={session.email}
                showAdminLink={session.role === "ADMIN"}
              />
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Log ind
                </Button>
              </Link>
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {session?.name ? `Hej ${session.name} -  ` : ""}
            Tidslinje 2026
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Fra Distortion Ø til Karrusel.
          </p>
        </div>

        {session && canPlayOfficialMinigame && todaysGame ? (
          <div className="mb-8">
            <Link href="/game">
              <Button className="w-full">
                {`Spil dagens minigame: ${todaysGame.title}`}
              </Button>
            </Link>
          </div>
        ) : null}

        {leaderboard && leaderboard.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pointtavle</CardTitle>
              <CardDescription>Spillere med flest point i alt</CardDescription>
            </CardHeader>
            <ol className="flex flex-col gap-2 px-6 pb-6">
              {leaderboard.map((entry, index) => (
                <li
                  key={entry.userId}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-center text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {entry.points}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}

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
              {events.map((event, index) => {
                const previousEvent = index > 0 ? events[index - 1] : undefined;
                const showMonthHeader =
                  !previousEvent ||
                  getMonthKey(previousEvent.startDate) !== getMonthKey(event.startDate);

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
    </>
  );
}
