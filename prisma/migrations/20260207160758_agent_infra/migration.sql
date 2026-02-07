-- CreateEnum
CREATE TYPE "AgentChannel" AS ENUM ('WEB_FORM', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "AgentThreadStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "AgentMessageDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AgentJobType" AS ENUM ('PROCESS_BOOKING_EVENT', 'PROCESS_INBOUND_MESSAGE');

-- CreateEnum
CREATE TYPE "AgentJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "BookingEvent" ADD COLUMN     "processedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AgentThread" (
    "id" TEXT NOT NULL,
    "channel" "AgentChannel" NOT NULL,
    "externalId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "status" "AgentThreadStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "direction" "AgentMessageDirection" NOT NULL,
    "text" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJob" (
    "id" TEXT NOT NULL,
    "type" "AgentJobType" NOT NULL,
    "payload" JSONB NOT NULL,
    "bookingEventId" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL,
    "status" "AgentJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentThread_status_lastMessageAt_idx" ON "AgentThread"("status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "AgentThread_customerEmail_idx" ON "AgentThread"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "AgentThread_channel_externalId_key" ON "AgentThread"("channel", "externalId");

-- CreateIndex
CREATE INDEX "AgentMessage_threadId_createdAt_idx" ON "AgentMessage"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentJob_bookingEventId_key" ON "AgentJob"("bookingEventId");

-- CreateIndex
CREATE INDEX "AgentJob_status_runAt_idx" ON "AgentJob"("status", "runAt");

-- CreateIndex
CREATE INDEX "AgentJob_type_status_runAt_idx" ON "AgentJob"("type", "status", "runAt");

-- CreateIndex
CREATE INDEX "BookingEvent_processedAt_idx" ON "BookingEvent"("processedAt");

-- AddForeignKey
ALTER TABLE "AgentMessage" ADD CONSTRAINT "AgentMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AgentThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
