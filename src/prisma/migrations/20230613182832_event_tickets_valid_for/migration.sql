/*
  Warnings:

  - You are about to drop the column `media_website` on the `live_streamings` table. All the data in the column will be lost.
  - You are about to drop the `EventContact` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "live_streamings" DROP COLUMN "media_website";

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "valid_for" DATE[];

-- DropTable
DROP TABLE "EventContact";
