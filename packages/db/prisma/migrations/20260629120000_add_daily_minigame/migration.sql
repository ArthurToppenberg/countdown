-- CreateTable
CREATE TABLE "DailyMinigame" (
    "copenhagenDateKey" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMinigame_pkey" PRIMARY KEY ("copenhagenDateKey")
);

-- AlterTable (nullable first so existing rows can be backfilled)
ALTER TABLE "Minigame" ADD COLUMN "dailyMinigameId" TEXT;

-- Backfill daily rounds from existing scores (Copenhagen calendar day, en-CA YYYY-MM-DD)
INSERT INTO "DailyMinigame" ("copenhagenDateKey", "gameId", "createdAt")
SELECT DISTINCT
    to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Copenhagen', 'YYYY-MM-DD'),
    'tower-stack',
    CURRENT_TIMESTAMP
FROM "Minigame"
ON CONFLICT ("copenhagenDateKey") DO NOTHING;

UPDATE "Minigame"
SET "dailyMinigameId" = to_char(
    ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Copenhagen',
    'YYYY-MM-DD'
);

ALTER TABLE "Minigame" ALTER COLUMN "dailyMinigameId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Minigame_dailyMinigameId_userId_key" ON "Minigame"("dailyMinigameId", "userId");

-- AddForeignKey
ALTER TABLE "Minigame" ADD CONSTRAINT "Minigame_dailyMinigameId_fkey" FOREIGN KEY ("dailyMinigameId") REFERENCES "DailyMinigame"("copenhagenDateKey") ON DELETE CASCADE ON UPDATE CASCADE;
