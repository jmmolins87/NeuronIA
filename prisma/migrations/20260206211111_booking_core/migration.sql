/*
  Warnings:

  - Added the required column `endAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HELD', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingTokenKind" AS ENUM ('SESSION');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "locale" TEXT NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "BookingStatus" NOT NULL,
ADD COLUMN     "timezone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BookingToken" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "BookingTokenKind" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingToken_tokenHash_key" ON "BookingToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingToken_bookingId_kind_idx" ON "BookingToken"("bookingId", "kind");

-- CreateIndex
CREATE INDEX "BookingToken_expiresAt_idx" ON "BookingToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Booking_startAt_idx" ON "Booking"("startAt");

-- CreateIndex
CREATE INDEX "Booking_status_startAt_idx" ON "Booking"("status", "startAt");

-- CreateIndex
CREATE INDEX "Booking_expiresAt_idx" ON "Booking"("expiresAt");

-- Prevent double-booking for active statuses
CREATE UNIQUE INDEX "Booking_startAt_unique_active" ON "Booking"("startAt") WHERE ("status" IN ('HELD', 'CONFIRMED'));

-- AddForeignKey
ALTER TABLE "BookingToken" ADD CONSTRAINT "BookingToken_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
