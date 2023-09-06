/*
  Warnings:

  - You are about to drop the column `valid_for` on the `tickets` table. All the data in the column will be lost.
  - The `qr_status` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ticket_payment" ADD COLUMN     "service_fee" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "valid_for",
DROP COLUMN "qr_status",
ADD COLUMN     "qr_status" DATE[];
