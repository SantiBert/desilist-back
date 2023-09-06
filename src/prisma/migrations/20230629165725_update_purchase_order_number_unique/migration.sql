/*
  Warnings:

  - A unique constraint covering the columns `[purchase_order_number]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tickets_purchase_order_number_key" ON "tickets"("purchase_order_number");
