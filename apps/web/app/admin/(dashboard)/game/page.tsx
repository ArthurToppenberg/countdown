import { GamesManager } from "@/components/games-manager";
import { listRegisteredGamesWithStatus } from "@countdown/game";

export default function AdminGamesPage() {
  const games = listRegisteredGamesWithStatus();

  return <GamesManager games={games} />;
}
