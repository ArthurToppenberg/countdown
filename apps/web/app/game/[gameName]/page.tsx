import { notFound } from "next/navigation";

import { getMinigame, MinigamePlayer } from "@countdown/minigame";

type GamePageProps = {
  params: Promise<{
    gameName: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameName } = await params;
  const game = getMinigame(gameName);

  if (!game) {
    notFound();
  }

  const initialState = await game.getInitialState();

  return (
    <div className="h-dvh overflow-hidden overscroll-none">
      <MinigamePlayer
        gameId={game.id}
        initialState={initialState}
        mode="practice"
        variant="standalone"
      />
    </div>
  );
}
