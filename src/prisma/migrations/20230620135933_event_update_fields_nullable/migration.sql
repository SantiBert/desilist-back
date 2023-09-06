-- DropIndex
DROP INDEX "event_locations_event_id_key";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "contact_information" DROP NOT NULL,
ALTER COLUMN "website" DROP NOT NULL;
