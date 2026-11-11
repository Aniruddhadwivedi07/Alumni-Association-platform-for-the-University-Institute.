-- CreateTable
CREATE TABLE "DonationCampaign" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationTransaction" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "donorId" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentProvider" TEXT,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DonationCampaign_createdById_idx" ON "DonationCampaign"("createdById");

-- CreateIndex
CREATE INDEX "DonationCampaign_isActive_idx" ON "DonationCampaign"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DonationTransaction_providerPaymentId_key" ON "DonationTransaction"("providerPaymentId");

-- CreateIndex
CREATE INDEX "DonationTransaction_campaignId_idx" ON "DonationTransaction"("campaignId");

-- CreateIndex
CREATE INDEX "DonationTransaction_donorId_idx" ON "DonationTransaction"("donorId");

-- CreateIndex
CREATE INDEX "DonationTransaction_status_idx" ON "DonationTransaction"("status");

-- CreateIndex
CREATE INDEX "DonationTransaction_createdAt_idx" ON "DonationTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "DonationCampaign" ADD CONSTRAINT "DonationCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationTransaction" ADD CONSTRAINT "DonationTransaction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationTransaction" ADD CONSTRAINT "DonationTransaction_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
