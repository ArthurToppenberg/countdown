-- AddForeignKey
ALTER TABLE "Minigame" ADD CONSTRAINT "Minigame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
