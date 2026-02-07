-- Step 5: reschedule relation (from booking -> to booking)

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "rescheduledToBookingId" TEXT;

CREATE INDEX IF NOT EXISTS "Booking_rescheduledToBookingId_idx" ON "Booking"("rescheduledToBookingId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Booking_rescheduledToBookingId_fkey'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "Booking_rescheduledToBookingId_fkey"
      FOREIGN KEY ("rescheduledToBookingId") REFERENCES "Booking"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
