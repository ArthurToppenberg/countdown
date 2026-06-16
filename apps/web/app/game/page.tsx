import { redirect } from "next/navigation";

import {
  getCrossTheVodkaRedbullState,
  getFeaturedMinigame,
  MinigamePlayer,
} from "@countdown/minigame";

import { getActiveEvent } from "@/lib/active-event";
import { getSession } from "@/lib/auth";
import {
  cashOutCompetitiveCrossTheVodkaRedbull,
  competitiveResetNotAllowed,
  takeCompetitiveCrossTheVodkaRedbullStep,
} from "@/lib/minigame/competitive-cross-the-vodka-redbull-actions";
import { getTodaysMinigameScore } from "@/lib/minigame/daily-minigame";

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

  const featuredGame = getFeaturedMinigame();
  const initialState = await getCrossTheVodkaRedbullState("competitive");

  return (
    <div className="h-dvh overflow-hidden overscroll-none">
      <MinigamePlayer
        actions={{
          takeStep: takeCompetitiveCrossTheVodkaRedbullStep,
          cashOut: cashOutCompetitiveCrossTheVodkaRedbull,
          reset: competitiveResetNotAllowed,
        }}
        gameId={featuredGame.id}
        initialState={initialState}
        mode="competitive"
        variant="standalone"
      />
    </div>
  );
}
