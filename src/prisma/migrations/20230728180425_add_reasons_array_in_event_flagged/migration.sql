/*
  Warnings:

  - You are about to drop the column `reason_id` on the `event_flagged` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_flagged" DROP CONSTRAINT "event_flagged_reason_id_fkey";

-- AlterTable
ALTER TABLE "event_flagged" DROP COLUMN "reason_id",
ADD COLUMN     "reasons_id" INTEGER[];
