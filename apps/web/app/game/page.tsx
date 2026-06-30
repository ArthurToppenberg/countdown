import { notFound, redirect } from "next/navigation";

import { getGame, GamePlayer } from "@countdown/game";

import { getSession } from "@/lib/auth";
import { getCompetitiveGameActions } from "@/lib/game/competitive-game-actions";
import { getTodaysGameScore } from "@/lib/game/daily-game";
import { getOrCreateTodaysDailyGame } from "@/lib/game/daily-game-round";

export default async function DailyGamePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/game");
  }

  const todaysScore = await getTodaysGameScore(session.userId);

  if (todaysScore) {
    redirect("/");
  }

  const todaysRound = await getOrCreateTodaysDailyGame();
  const game = getGame(todaysRound.gameId);

  if (!game) {
    redirect("/game/unavailable");
  }

  const actions = getCompetitiveGameActions(game.id);

  if (!actions) {
    notFound();
  }

  const initialState = await game.getInitialState("competitive");

  return (
    <div className="h-dvh overflow-hidden overscroll-none">
      <GamePlayer
        actions={actions}
        gameId={game.id}
        initialState={initialState}
        mode="competitive"
        variant="standalone"
      />
    </div>
  );
}
