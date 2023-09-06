/*
  Warnings:

  - The primary key for the `event_payments` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "event_payments" DROP CONSTRAINT "event_payments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_payments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_payments_id_seq";
