-- DropIndex
DROP INDEX "public"."events_startDate_id_idx";

-- DropIndex
DROP INDEX "public"."events_status_startDate_id_idx";

-- CreateIndex
CREATE INDEX "Car_collectionType_createdAt_idx" ON "Car"("collectionType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TicketType_eventId_quantity_price_idx" ON "TicketType"("eventId", "quantity", "price");

-- CreateIndex
CREATE INDEX "events_status_startDate_id_idx" ON "events"("status", "startDate", "id");
