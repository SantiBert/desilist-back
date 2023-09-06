/*
  Warnings:

  - You are about to drop the `event_live_streaming` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `event_id` to the `live_streamings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_live_streaming" DROP CONSTRAINT "event_live_streaming_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_live_streaming" DROP CONSTRAINT "event_live_streaming_live_streaming_id_fkey";

-- AlterTable
ALTER TABLE "live_streamings" ADD COLUMN     "event_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "event_live_streaming";

-- AddForeignKey
ALTER TABLE "live_streamings" ADD CONSTRAINT "live_streamings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
