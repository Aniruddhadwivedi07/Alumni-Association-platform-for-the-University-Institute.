-- Create dedicated atomic sequence for alumni verification sequence allocation
CREATE SEQUENCE IF NOT EXISTS "alumni_verification_seq" START WITH 1 INCREMENT BY 1;

-- CreateTable
CREATE TABLE "AlumniVerification" (
    "id" SERIAL NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "publicTokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedById" INTEGER NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedById" INTEGER,
    "revocationReason" TEXT,
    "alumniProfileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlumniVerification_sequenceNumber_key" ON "AlumniVerification"("sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniVerification_verificationCode_key" ON "AlumniVerification"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniVerification_publicTokenHash_key" ON "AlumniVerification"("publicTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniVerification_alumniProfileId_key" ON "AlumniVerification"("alumniProfileId");

-- CreateIndex
CREATE INDEX "AlumniVerification_verificationCode_idx" ON "AlumniVerification"("verificationCode");

-- CreateIndex
CREATE INDEX "AlumniVerification_publicTokenHash_idx" ON "AlumniVerification"("publicTokenHash");

-- CreateIndex
CREATE INDEX "AlumniVerification_status_idx" ON "AlumniVerification"("status");

-- AddForeignKey
ALTER TABLE "AlumniVerification" ADD CONSTRAINT "AlumniVerification_alumniProfileId_fkey" FOREIGN KEY ("alumniProfileId") REFERENCES "AlumniProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniVerification" ADD CONSTRAINT "AlumniVerification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniVerification" ADD CONSTRAINT "AlumniVerification_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
