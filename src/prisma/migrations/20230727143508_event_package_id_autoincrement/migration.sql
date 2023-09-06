-- AlterTable
CREATE SEQUENCE "event_packages_id_seq";
ALTER TABLE "event_packages" ALTER COLUMN "id" SET DEFAULT nextval('event_packages_id_seq');
ALTER SEQUENCE "event_packages_id_seq" OWNED BY "event_packages"."id";
