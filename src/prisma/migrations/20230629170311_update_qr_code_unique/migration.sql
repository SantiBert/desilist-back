/*
  Warnings:

  - A unique constraint covering the columns `[qr_code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tickets_purchase_order_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qr_code_key" ON "tickets"("qr_code");
