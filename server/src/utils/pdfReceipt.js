'use strict';

const PDFDocument = require('pdfkit');

/**
 * Generate a PDF donation receipt as a stream
 *
 * @param {Object} data Receipt details
 * @param {string} data.receiptNumber
 * @param {string} data.donorName
 * @param {string} data.donorEmail
 * @param {string} data.amount
 * @param {string} data.currency
 * @param {string} data.campaignTitle
 * @param {Date|string} data.donationDate
 * @param {string} data.paymentReference
 * @param {string} data.paymentStatus
 * @param {string} [data.institutionName]
 * @returns {PDFKit.PDFDocument}
 */
function createDonationReceiptPdf(data) {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });

  const institutionName = data.institutionName || 'Alumni Association Platform';
  const donationDateStr = new Date(data.donationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Header Banner
  doc
    .fillColor('#1E3A8A') // Dark blue
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(institutionName, { align: 'center' });

  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#64748B')
    .text('Official Donation & Contribution Receipt', { align: 'center' });

  doc.moveDown(1.5);

  // Decorative horizontal divider
  doc
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(1.5);

  // Receipt Number & Date metadata box
  const startY = doc.y;
  doc
    .rect(50, startY, 495, 45)
    .fillColor('#F8FAFC')
    .fill();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#0F172A')
    .text(`RECEIPT NUMBER: ${data.receiptNumber}`, 65, startY + 12);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#475569')
    .text(`Date Issued: ${donationDateStr}`, 65, startY + 26);

  doc.moveDown(3);

  // Table of details
  const details = [
    { label: 'Donor Name', value: data.donorName },
    { label: 'Campaign Title', value: data.campaignTitle },
    { label: 'Contribution Amount', value: `${data.amount} ${data.currency}` },
    { label: 'Payment Status', value: data.paymentStatus },
    { label: 'Payment Reference', value: data.paymentReference || 'N/A' },
    { label: 'Payment Provider', value: data.paymentProvider || 'RAZORPAY' }
  ];

  let currentY = doc.y + 10;

  details.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc
        .rect(50, currentY - 4, 495, 24)
        .fillColor('#F1F5F9')
        .fill();
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#334155')
      .text(item.label, 65, currentY + 3, { width: 180 });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#0F172A')
      .text(item.value, 250, currentY + 3, { width: 280 });

    currentY += 24;
  });

  doc.y = currentY + 25;

  // Acknowledgement paragraph
  doc
    .font('Helvetica-Oblique')
    .fontSize(10)
    .fillColor('#475569')
    .text(
      `Thank you for your generous contribution to "${data.campaignTitle}". Your support empowers our alumni community and institutional initiatives.`,
      50,
      doc.y,
      { width: 495, align: 'center' }
    );

  doc.moveDown(2);

  // Verification seal note
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#94A3B8')
    .text(
      'This document is an electronically generated receipt verified by the Alumni Association Platform. No physical signature is required.',
      50,
      doc.y,
      { width: 495, align: 'center' }
    );

  doc.end();

  return doc;
}

module.exports = {
  createDonationReceiptPdf
};

