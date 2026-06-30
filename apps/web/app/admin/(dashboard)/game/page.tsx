import { GamesManager } from "@/components/games-manager";
import { listRegisteredMinigamesWithStatus } from "@countdown/minigame";

export default function AdminGamesPage() {
  const games = listRegisteredMinigamesWithStatus();

  return <GamesManager games={games} />;
}
