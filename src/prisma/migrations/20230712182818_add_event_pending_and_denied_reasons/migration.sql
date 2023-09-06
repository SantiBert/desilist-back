-- CreateTable
CREATE TABLE "event_pending" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "reason_id" INTEGER NOT NULL,
    "explanation" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "new_changes" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_pending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denied_reasons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "denied_reasons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_pending" ADD CONSTRAINT "event_pending_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_pending" ADD CONSTRAINT "event_pending_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "denied_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
