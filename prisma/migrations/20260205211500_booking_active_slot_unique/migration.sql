-- Prevent double booking under concurrency:
-- A slot is considered occupied if status IN ('HELD','CONFIRMED').
-- Note: HELD is only treated as active at runtime when expiresAt > now,
-- but the DB constraint keeps concurrent inserts safe.

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_startAt_active_unique"
ON "Booking"("startAt")
WHERE "status" IN ('HELD', 'CONFIRMED');
