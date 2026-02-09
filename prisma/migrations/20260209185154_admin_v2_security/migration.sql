-- CreateEnum
CREATE TYPE "AdminMode" AS ENUM ('REAL', 'DEMO');

-- AlterTable AdminUser - Add security columns
ALTER TABLE "AdminUser" ADD COLUMN "mode" "AdminMode" NOT NULL DEFAULT 'REAL';
ALTER TABLE "AdminUser" ADD COLUMN "lastLoginIp" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AdminUser" ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);
ALTER TABLE "AdminUser" ADD COLUMN "lockedUntil" TIMESTAMP(3);

-- CreateTable AdminSession
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "csrfToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserAdminAudit
CREATE TABLE "UserAdminAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "targetAdminId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "UserAdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionToken_key" ON "AdminSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_csrfToken_key" ON "AdminSession"("csrfToken");

-- CreateIndex
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminSession_sessionToken_idx" ON "AdminSession"("sessionToken");

-- CreateIndex
CREATE INDEX "UserAdminAudit_adminId_createdAt_idx" ON "UserAdminAudit"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "UserAdminAudit_targetAdminId_createdAt_idx" ON "UserAdminAudit"("targetAdminId", "createdAt");

-- CreateIndex
CREATE INDEX "UserAdminAudit_action_createdAt_idx" ON "UserAdminAudit"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminUser_username_idx" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "AdminUser_lockedUntil_idx" ON "AdminUser"("lockedUntil");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdminAudit" ADD CONSTRAINT "UserAdminAudit_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdminAudit" ADD CONSTRAINT "UserAdminAudit_targetAdminId_fkey" FOREIGN KEY ("targetAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
