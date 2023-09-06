/*
  Warnings:

  - You are about to drop the column `ticket_id` on the `ticket_payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticket_payment" DROP CONSTRAINT "ticket_payment_ticket_id_fkey";

-- AlterTable
ALTER TABLE "ticket_payment" DROP COLUMN "ticket_id";

-- CreateTable
CREATE TABLE "ticket_payment_tickets" (
    "payment_id" TEXT NOT NULL,
    "ticket_id" INTEGER NOT NULL,

    CONSTRAINT "ticket_payment_tickets_pkey" PRIMARY KEY ("payment_id","ticket_id")
);

-- AddForeignKey
ALTER TABLE "ticket_payment_tickets" ADD CONSTRAINT "ticket_payment_tickets_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_payment_tickets" ADD CONSTRAINT "ticket_payment_tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "ticket_payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
