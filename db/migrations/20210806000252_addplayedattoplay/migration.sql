-- AlterTable
ALTER TABLE "TrackPlay" ADD COLUMN     "playedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TrackPlay.userId_playedAt_index" ON "TrackPlay"("userId", "playedAt");
