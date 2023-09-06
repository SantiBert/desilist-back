/*
  Warnings:

  - You are about to drop the `event_price` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_price" DROP CONSTRAINT "event_price_event_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "event_price" DROP CONSTRAINT "event_price_promote_pricing_id_fkey";

-- AlterTable
ALTER TABLE "Timezone" ALTER COLUMN "abbreviation" SET DATA TYPE VARCHAR(4);

-- DropTable
DROP TABLE "event_price";

-- CreateTable
CREATE TABLE "event_prices" (
    "event_subcategory_id" INTEGER NOT NULL,
    "promote_pricing_id" INTEGER NOT NULL,
    "promote_per_day" INTEGER NOT NULL,

    CONSTRAINT "event_prices_pkey" PRIMARY KEY ("event_subcategory_id","promote_pricing_id")
);

-- CreateTable
CREATE TABLE "event_bookmarks" (
    "user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "event_bookmarks_pkey" PRIMARY KEY ("user_id","event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_prices_event_subcategory_id_promote_pricing_id_key" ON "event_prices"("event_subcategory_id", "promote_pricing_id");

-- AddForeignKey
ALTER TABLE "event_prices" ADD CONSTRAINT "event_prices_promote_pricing_id_fkey" FOREIGN KEY ("promote_pricing_id") REFERENCES "promote_pricing_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_prices" ADD CONSTRAINT "event_prices_event_subcategory_id_fkey" FOREIGN KEY ("event_subcategory_id") REFERENCES "event_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
