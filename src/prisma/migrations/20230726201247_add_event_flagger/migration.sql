-- CreateTable
CREATE TABLE "event_flagged" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "reason_id" INTEGER,
    "explanation" TEXT,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "new_changes" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_flagged_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_flag_reports" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason_id" INTEGER,
    "explanation" TEXT,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_flag_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_flagged" ADD CONSTRAINT "event_flagged_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "listings_flag_reports_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_flagged" ADD CONSTRAINT "event_flagged_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_flag_reports" ADD CONSTRAINT "event_flag_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_flag_reports" ADD CONSTRAINT "event_flag_reports_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "listings_flag_reports_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_flag_reports" ADD CONSTRAINT "event_flag_reports_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
