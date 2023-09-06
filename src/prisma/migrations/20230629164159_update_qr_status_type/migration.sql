/*
  Warnings:

  - The `qr_status` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "qr_status",
ADD COLUMN     "qr_status" JSONB[];
