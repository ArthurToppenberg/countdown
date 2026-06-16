-- CreateEnum
CREATE TYPE "MinigameType" AS ENUM ('TEST', 'POINT');

-- CreateTable
CREATE TABLE "Minigame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MinigameType" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Minigame_pkey" PRIMARY KEY ("id")
);
