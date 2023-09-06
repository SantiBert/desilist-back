-- DropForeignKey
ALTER TABLE "event_pending" DROP CONSTRAINT "event_pending_reason_id_fkey";

-- AlterTable
ALTER TABLE "event_pending" ALTER COLUMN "reason_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "event_pending" ADD CONSTRAINT "event_pending_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "denied_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
