import { notFound, redirect } from "next/navigation";

import { getRegisteredMinigame, MinigamePlayer } from "@countdown/minigame";

import { getActiveEvent } from "@/lib/active-event";
import { getSession } from "@/lib/auth";
import { getCompetitiveMinigameActions } from "@/lib/minigame/competitive-minigame-actions";
import { getTodaysMinigameScore } from "@/lib/minigame/daily-minigame";
import { getOrCreateTodaysDailyMinigame } from "@/lib/minigame/daily-minigame-round";

export default async function DailyGamePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/game");
  }

  const activeEvent = await getActiveEvent();

  if (activeEvent) {
    redirect("/");
  }

  const todaysScore = await getTodaysMinigameScore(session.userId);

  if (todaysScore) {
    redirect("/");
  }

  const todaysRound = await getOrCreateTodaysDailyMinigame();
  const game = getRegisteredMinigame(todaysRound.gameId);

  if (!game) {
    notFound();
  }

  const actions = getCompetitiveMinigameActions(game.id);

  if (!actions) {
    notFound();
  }

  const initialState = await game.getInitialState("competitive");

  return (
    <div className="h-dvh overflow-hidden overscroll-none">
      <MinigamePlayer
        actions={actions}
        gameId={game.id}
        initialState={initialState}
        mode="competitive"
        variant="standalone"
      />
    </div>
  );
}
