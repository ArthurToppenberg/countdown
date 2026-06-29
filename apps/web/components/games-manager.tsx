import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { type MinigameManifestStatus } from "@countdown/minigame";
import { Badge } from "@countdown/ui/components/badge";
import { Button } from "@countdown/ui/components/button";

type GamesManagerProps = {
  games: MinigameManifestStatus[];
};

const getPracticeGamePath = (gameId: string): string => `/game/${gameId}`;

export const GamesManager = ({ games }: GamesManagerProps) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
      <p className="text-sm text-muted-foreground">
        Oversigt over registrerede minigames og deres status i manifestet.
      </p>
    </div>

    {games.length === 0 ? (
      <p className="text-sm text-muted-foreground">Ingen games registreret.</p>
    ) : (
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 align-middle font-medium">
                  {game.title}
                </td>
                <td className="px-4 py-3 align-middle">
                  <code className="text-xs text-muted-foreground">{game.id}</code>
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge variant={game.active ? "default" : "secondary"}>
                    {game.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-middle">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link
                        href={getPracticeGamePath(game.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLinkIcon />
                    Test spil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
