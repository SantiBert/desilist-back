/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `Timezone` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Timezone` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[event_subcategory_id,promote_pricing_id]` on the table `event_price` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "type" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Timezone_abbreviation_key" ON "Timezone"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Timezone_name_key" ON "Timezone"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_price_event_subcategory_id_promote_pricing_id_key" ON "event_price"("event_subcategory_id", "promote_pricing_id");
