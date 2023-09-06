-- AddForeignKey
ALTER TABLE "event_payments" ADD CONSTRAINT "event_payments_promote_package_id_fkey" FOREIGN KEY ("promote_package_id") REFERENCES "promote_pricing_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
