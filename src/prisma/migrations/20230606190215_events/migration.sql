-- CreateTable
CREATE TABLE "event_subcategories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "event_publication_price" DOUBLE PRECISION,
    "service_fee" DOUBLE PRECISION,
    "name" VARCHAR(100) NOT NULL,
    "custom_fields" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "list_order" INTEGER,
    "showed_landing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_locations" (
    "id" SERIAL NOT NULL,
    "geometry_point" JSONB NOT NULL,
    "srid" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "event_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_organizers" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "organization_name" TEXT,
    "hosted_by" TEXT,
    "contact_number" TEXT,

    CONSTRAINT "event_organizers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_price" (
    "event_subcategory_id" INTEGER NOT NULL,
    "promote_pricing_id" INTEGER NOT NULL,
    "promote_per_day" INTEGER NOT NULL,

    CONSTRAINT "event_price_pkey" PRIMARY KEY ("event_subcategory_id","promote_pricing_id")
);

-- CreateTable
CREATE TABLE "desilist_terms" (
    "id" SERIAL NOT NULL,
    "term_description" TEXT NOT NULL,

    CONSTRAINT "desilist_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desilist_terms_events" (
    "event_id" INTEGER NOT NULL,
    "desilist_term_id" INTEGER NOT NULL,

    CONSTRAINT "desilist_terms_events_pkey" PRIMARY KEY ("event_id","desilist_term_id")
);

-- CreateTable
CREATE TABLE "event_terms" (
    "id" SERIAL NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "event_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_terms_events" (
    "event_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,

    CONSTRAINT "event_terms_events_pkey" PRIMARY KEY ("event_id","term_id")
);

-- CreateTable
CREATE TABLE "EventContact" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "EventContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timezone" (
    "id" SERIAL NOT NULL,
    "abbreviation" CHAR(4) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "utc_offset" INTEGER NOT NULL,

    CONSTRAINT "Timezone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "subcategory_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "has_banner" BOOLEAN NOT NULL,
    "venue_location_id" INTEGER,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "timezone_id" INTEGER NOT NULL,
    "has_ticket" BOOLEAN NOT NULL,
    "contact_information" JSONB NOT NULL,
    "website" TEXT NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_live_streaming" (
    "event_id" INTEGER NOT NULL,
    "live_streaming_id" INTEGER NOT NULL,

    CONSTRAINT "event_live_streaming_pkey" PRIMARY KEY ("event_id","live_streaming_id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_streamings" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media_website" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,

    CONSTRAINT "live_streamings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "qr_code" INTEGER NOT NULL,
    "qr_code_image" JSONB NOT NULL,
    "qr_status" INTEGER NOT NULL,
    "ticket_type_id" INTEGER NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "purchase_order_number" TEXT NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_types" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity_avaible" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "max_quantity_order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ticket_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_subcategories" ADD CONSTRAINT "event_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_price" ADD CONSTRAINT "event_price_promote_pricing_id_fkey" FOREIGN KEY ("promote_pricing_id") REFERENCES "promote_pricing_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_price" ADD CONSTRAINT "event_price_event_subcategory_id_fkey" FOREIGN KEY ("event_subcategory_id") REFERENCES "event_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desilist_terms_events" ADD CONSTRAINT "desilist_terms_events_desilist_term_id_fkey" FOREIGN KEY ("desilist_term_id") REFERENCES "desilist_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desilist_terms_events" ADD CONSTRAINT "desilist_terms_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_terms_events" ADD CONSTRAINT "event_terms_events_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "event_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_terms_events" ADD CONSTRAINT "event_terms_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "listings_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "event_subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_location_id_fkey" FOREIGN KEY ("venue_location_id") REFERENCES "event_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_timezone_id_fkey" FOREIGN KEY ("timezone_id") REFERENCES "Timezone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_live_streaming" ADD CONSTRAINT "event_live_streaming_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_live_streaming" ADD CONSTRAINT "event_live_streaming_live_streaming_id_fkey" FOREIGN KEY ("live_streaming_id") REFERENCES "live_streamings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streamings" ADD CONSTRAINT "live_streamings_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "ticket_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
