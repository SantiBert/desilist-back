-- CreateTable
CREATE TABLE "event_packages" (
    "id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "promote_package_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "paused_at" TIMESTAMP(3),

    CONSTRAINT "event_packages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_packages" ADD CONSTRAINT "event_packages_promote_package_id_fkey" FOREIGN KEY ("promote_package_id") REFERENCES "promote_pricing_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_packages" ADD CONSTRAINT "event_packages_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
