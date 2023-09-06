-- DropForeignKey
ALTER TABLE "ticket_payment_tickets" DROP CONSTRAINT "ticket_payment_tickets_ticket_id_fkey";

-- AddForeignKey
ALTER TABLE "ticket_payment_tickets" ADD CONSTRAINT "ticket_payment_tickets_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
