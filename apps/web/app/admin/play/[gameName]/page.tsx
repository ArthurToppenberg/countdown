import { redirect } from "next/navigation";

import { getRegisteredGame, GamePlayer } from "@countdown/game";

import { getSession } from "@/lib/auth";

type AdminPlayPageProps = {
  params: Promise<{
    gameName: string;
  }>;
};

export default async function AdminPlayPage({ params }: AdminPlayPageProps) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const { gameName } = await params;
  const game = getRegisteredGame(gameName);

  if (!game) {
    redirect("/admin/game");
  }

  const initialState = await game.getInitialState();

  return (
    <div className="h-dvh overflow-hidden overscroll-none">
      <GamePlayer
        gameId={game.id}
        initialState={initialState}
        mode="practice"
        variant="standalone"
      />
    </div>
  );
}
