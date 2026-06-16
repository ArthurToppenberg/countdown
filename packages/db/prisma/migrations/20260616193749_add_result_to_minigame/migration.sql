/*
  Warnings:

  - You are about to drop the column `points` on the `Minigame` table. All the data in the column will be lost.
  - Added the required column `result` to the `Minigame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Minigame" DROP COLUMN "points",
ADD COLUMN     "result" JSONB NOT NULL;
