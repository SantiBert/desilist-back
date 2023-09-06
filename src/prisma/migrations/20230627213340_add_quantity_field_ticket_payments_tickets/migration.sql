/*
  Warnings:

  - Added the required column `quantity` to the `ticket_payment_tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_payment_tickets" ADD COLUMN     "quantity" INTEGER NOT NULL;
