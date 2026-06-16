/*
  Warnings:

  - You are about to drop the column `result` on the `Minigame` table. All the data in the column will be lost.
  - Added the required column `points` to the `Minigame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Minigame" DROP COLUMN "result",
ADD COLUMN     "points" INTEGER NOT NULL;
