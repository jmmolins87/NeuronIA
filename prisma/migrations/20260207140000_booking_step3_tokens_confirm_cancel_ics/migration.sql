-- Step 3: confirm/cancel/reschedule tokens + booking metadata + outbox

-- Extend token kind enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'CANCEL'
      AND enumtypid = '"BookingTokenKind"'::regtype
  ) THEN
    ALTER TYPE "BookingTokenKind" ADD VALUE 'CANCEL';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'RESCHEDULE'
      AND enumtypid = '"BookingTokenKind"'::regtype
  ) THEN
    ALTER TYPE "BookingTokenKind" ADD VALUE 'RESCHEDULE';
  END IF;
END $$;

-- Booking: allow expiresAt to be NULL once confirmed
ALTER TABLE "Booking" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- Booking: confirmation + contact + ROI + stable UID
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "uid" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "contactClinicName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "roiData" JSONB,
  ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

-- Backfill uid for existing rows
UPDATE "Booking"
SET "uid" = "id"
WHERE "uid" IS NULL;

-- Enforce uid presence + uniqueness
ALTER TABLE "Booking" ALTER COLUMN "uid" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_uid_key" ON "Booking"("uid");

-- Outbox table for downstream automation
CREATE TABLE IF NOT EXISTS "BookingEvent" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BookingEvent_bookingId_createdAt_idx" ON "BookingEvent"("bookingId", "createdAt");
CREATE INDEX IF NOT EXISTS "BookingEvent_type_createdAt_idx" ON "BookingEvent"("type", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'BookingEvent_bookingId_fkey'
  ) THEN
    ALTER TABLE "BookingEvent"
      ADD CONSTRAINT "BookingEvent_bookingId_fkey"
      FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
