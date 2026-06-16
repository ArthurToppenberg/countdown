/*
  Warnings:

  - You are about to drop the column `type` on the `Minigame` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Minigame" DROP COLUMN "type";

-- DropEnum
DROP TYPE "MinigameType";
