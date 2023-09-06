/*
  Warnings:

  - You are about to drop the column `venue_location_id` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id]` on the table `event_locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `event_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `event_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `event_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `event_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipcode` to the `event_locations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_venue_location_id_fkey";

-- AlterTable
ALTER TABLE "event_locations" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD COLUMN     "place_id" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipcode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event_prices" ALTER COLUMN "promote_per_day" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "events" DROP COLUMN "venue_location_id";

-- CreateIndex
CREATE UNIQUE INDEX "event_locations_event_id_key" ON "event_locations"("event_id");

-- AddForeignKey
ALTER TABLE "event_locations" ADD CONSTRAINT "event_locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
