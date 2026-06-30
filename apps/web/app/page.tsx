import Link from "next/link";

import { FestivalCalendar } from "@/components/festival-calendar";
import { LogoutButton } from "@/components/logout-button";
import { getSession } from "@/lib/auth";
import {
  getGamePointsLeaderboard,
  getTodaysGameScore,
} from "@/lib/game/daily-game";
import { getOrCreateTodaysDailyGame } from "@/lib/game/daily-game-round";
import {
  getSeasonCountdown,
  getSeasonForDate,
  isScoringOpen,
  resolveSeasons,
} from "@/lib/game/festival-season";
import prisma from "@/lib/prisma";
import { getGame } from "@countdown/game";
import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";

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
    getGamePointsLeaderboard(10).catch(() => undefined),
    session
      ? getTodaysGameScore(session.userId).catch(() => undefined)
      : Promise.resolve(null),
  ]);
  const seasonState = events
    ? getSeasonForDate(resolveSeasons(events), now)
    : null;
  const seasonCountdown =
    seasonState?.inFestival ? getSeasonCountdown(seasonState, now) : null;
  const scoringOpen = seasonState === null ? true : isScoringOpen(seasonState, now);
  const hasPlayedTodaysGame = Boolean(todaysScore);
  const canPlayOfficialGame = !hasPlayedTodaysGame && scoringOpen;
  const todaysRound =
    canPlayOfficialGame && session
      ? await getOrCreateTodaysDailyGame().catch(() => undefined)
      : undefined;
  const todaysGame = todaysRound
    ? getGame(todaysRound.gameId)
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
            Kalender 2026
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Fra Distortion Ø til Karrusel.
          </p>
        </div>

        {session && canPlayOfficialGame && todaysGame ? (
          <div className="mb-8">
            <Link href="/game">
              <Button className="w-full">
                {`Spil dagens game: ${todaysGame.title}`}
              </Button>
            </Link>
          </div>
        ) : session && !hasPlayedTodaysGame && !scoringOpen ? (
          <Card className="mb-8">
            <CardHeader>
              {seasonCountdown ? (
                <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-4xl leading-none font-bold tabular-nums">
                    {seasonCountdown.daysRemainingLabel}
                  </span>
                  <span className="text-base font-medium">
                    {seasonCountdown.seasonName ? (
                      <>
                        til{" "}
                        <span className="text-amber-500">
                          {seasonCountdown.seasonName}
                        </span>
                      </>
                    ) : (
                      seasonCountdown.countdownNote
                    )}
                  </span>
                </CardTitle>
              ) : (
                <>
                  <CardTitle>Sæsonen er på pause</CardTitle>
                  <CardDescription>
                    Der er ingen aktiv sæson lige nu, så dagens game holder pause.
                  </CardDescription>
                </>
              )}
            </CardHeader>
          </Card>
        ) : null}

        {leaderboard && leaderboard.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pointtavle</CardTitle>
              <CardDescription>Point efter daglig placering</CardDescription>
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
          <FestivalCalendar events={events} today={now} />
        )}
      </main>
    </>
  );
}
