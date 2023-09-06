-- AlterTable
ALTER TABLE "event_prices" ALTER COLUMN "promote_per_day" SET DATA TYPE DECIMAL(65,30);

-- CreateTable
CREATE TABLE "event_payments" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "amount" DECIMAL(21,3) NOT NULL,
    "promote_package_id" INTEGER,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "event_payments_pkey" PRIMARY KEY ("id")
);
