import { sendChampionEmail } from "@countdown/email";

import { logger } from "@/lib/logger";
import {
  getCurrentSeason,
  getSeasonChampionHistory,
} from "@/lib/game/daily-game";
import { getSeasonsLockedSince } from "@/lib/game/festival-season";
import prisma from "@/lib/prisma";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type ChampionEmailBatchResult = {
  sent: number;
  failed: { email: string; error: string }[];
  festivalName: string | null;
};

const requireRecipientName = (name: string | null): string => {
  if (!name?.trim()) {
    throw new Error("Bruger mangler navn — kan ikke sende mester-e-mail");
  }

  return name.trim();
};

export const sendChampionEmailsForNewlyCrowned =
  async (): Promise<ChampionEmailBatchResult> => {
    const emptyResult: ChampionEmailBatchResult = {
      sent: 0,
      failed: [],
      festivalName: null,
    };

    const now = new Date();
    const { seasons } = await getCurrentSeason(now);
    const lockedSeasons = getSeasonsLockedSince(seasons, now, ONE_DAY_MS);

    if (lockedSeasons.length === 0) {
      return emptyResult;
    }

    const lockedFestivalIds = new Set(
      lockedSeasons.map((season) => season.festivalId),
    );
    const champions = (await getSeasonChampionHistory(seasons, now)).filter(
      (champion) => lockedFestivalIds.has(champion.festivalId),
    );

    if (champions.length === 0) {
      return emptyResult;
    }

    const champion = champions[champions.length - 1];

    const users = await prisma.user.findMany({
      where: { dagligEmailOptIn: true, password: { not: null } },
      select: { email: true, name: true },
    });

    const result: ChampionEmailBatchResult = {
      sent: 0,
      failed: [],
      festivalName: champion.festivalName,
    };

    for (const user of users) {
      try {
        await sendChampionEmail({
          to: user.email,
          name: requireRecipientName(user.name),
          festivalName: champion.festivalName,
          leaguePoints: champion.leaguePoints,
        });
        result.sent += 1;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        logger.error("Daglig", "Failed to send champion email to user", {
          email: user.email,
          errorMessage,
        });

        result.failed.push({ email: user.email, error: errorMessage });
      }
    }

    logger.info("Daglig", "Champion email batch finished", {
      festivalName: champion.festivalName,
      championName: champion.name,
      sent: result.sent,
      failed: result.failed.length,
    });

    return result;
  };
