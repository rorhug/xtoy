/*
  Warnings:

  - A unique constraint covering the columns `[spotifyAccountId]` on the table `SpotifyAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessExpiresAt` to the `SpotifyAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessToken` to the `SpotifyAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cachedProfile` to the `SpotifyAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `SpotifyAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyAccountId` to the `SpotifyAccount` table without a default value. This is not possible if the table is not empty.

*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "SpotifyAccount" ADD COLUMN     "accessExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "cachedProfile" JSONB NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "spotifyAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" CITEXT,
ALTER COLUMN "email" SET DATA TYPE CITEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount.spotifyAccountId_unique" ON "SpotifyAccount"("spotifyAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");
