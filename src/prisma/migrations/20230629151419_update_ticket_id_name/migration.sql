/*
  Warnings:

  - The primary key for the `ticket_payment_tickets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ticket_id` on the `ticket_payment_tickets` table. All the data in the column will be lost.
  - Added the required column `ticket_type_id` to the `ticket_payment_tickets` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "ticket_payment_tickets" RENAME COLUMN "ticket_id" TO "ticket_type_id";
-- DropForeignKey
ALTER TABLE "ticket_payment_tickets" DROP CONSTRAINT "ticket_payment_tickets_ticket_id_fkey";

-- AlterTable
ALTER TABLE "ticket_payment_tickets" DROP CONSTRAINT "ticket_payment_tickets_pkey",
/* DROP COLUMN "ticket_id", */
/* ADD COLUMN     "ticket_type_id" INTEGER NOT NULL, */
ADD CONSTRAINT "ticket_payment_tickets_pkey" PRIMARY KEY ("payment_id", "ticket_type_id");

-- AddForeignKey
ALTER TABLE "ticket_payment_tickets" ADD CONSTRAINT "ticket_payment_tickets_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
