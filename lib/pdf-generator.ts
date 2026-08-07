import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './types';

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Blue
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND HORIZON HOSTEL', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM RESIDENTIAL SUITES & STUDENT ACCOMMODATION', 14, 27);
  doc.text('GSTIN: 36AAACG1234F1Z9 • PhonePe Merchant UPI ID: grandhorizon@ybl', 14, 34);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE #: ${invoice.invoiceNumber || invoice.id}`, 145, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Billing Month: ${invoice.month} ${invoice.year}`, 145, 27);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 145, 34);

  // Bill To & Payment Metadata Block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 182, 38, 3, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESIDENT DETAILS:', 20, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${invoice.residentName}`, 20, 63);
  doc.text(`Room Number: Room ${invoice.roomNumber || 'N/A'}`, 20, 70);
  doc.text(`Invoice Period: 01 ${invoice.month} ${invoice.year} - End ${invoice.month} ${invoice.year}`, 20, 77);

  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS:', 115, 56);
  doc.setFont('helvetica', 'normal');

  const isPaid = invoice.status === 'PAID';
  doc.text(`Status: `, 115, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 16 : 225, isPaid ? 185 : 29, isPaid ? 129 : 72);
  doc.text(invoice.status, 130, 63);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '10th of Month'}`, 115, 70);
  if (invoice.transactionId) {
    doc.text(`PhonePe Txn #: ${invoice.transactionId}`, 115, 77);
  } else {
    doc.text(`UPI Payment VPA: grandhorizon@ybl`, 115, 77);
  }

  // Itemized Fee Breakdown Table
  const tableRows = [
    [
      `Monthly Room Rent (${invoice.month} ${invoice.year})`,
      'Base Accommodation Fee',
      `INR ${(invoice.rentAmount || 0).toLocaleString('en-IN')}`,
    ],
  ];

  if ((invoice.electricityCharges || 0) > 0 || (invoice.electricityUnits || 0) > 0) {
    tableRows.push([
      `Electricity Consumption (${invoice.electricityUnits || 0} Units @ ₹10/unit)`,
      'Sub-meter Utilities',
      `INR ${(invoice.electricityCharges || (invoice.electricityUnits || 0) * 10).toLocaleString('en-IN')}`,
    ]);
  }

  if ((invoice.waterCharges || 0) > 0) {
    tableRows.push([
      'Water & Sanitation Fixed Charge',
      'Municipal Utility',
      `INR ${(invoice.waterCharges || 0).toLocaleString('en-IN')}`,
    ]);
  }

  if ((invoice.utilityAmount || 0) > 0 && !invoice.electricityCharges && !invoice.waterCharges) {
    tableRows.push([
      'Wi-Fi, Water & Electricity Package',
      'Bundled Utilities',
      `INR ${(invoice.utilityAmount || 0).toLocaleString('en-IN')}`,
    ]);
  }

  if ((invoice.fine || 0) > 0) {
    tableRows.push([
      'Late Payment Fine / Overdue Administrative Surcharge',
      'Late Surcharge',
      `INR ${(invoice.fine || 0).toLocaleString('en-IN')}`,
    ]);
  }

  autoTable(doc, {
    startY: 92,
    head: [['Item Description & Utility Breakdown', 'Category', 'Amount (INR)']],
    body: tableRows,
    foot: [['TOTAL PAYABLE AMOUNT', '', `INR ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`]],
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 10 },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 140;

  // PhonePe / UPI Payment Guidance Box
  doc.setFillColor(243, 232, 255);
  doc.setDrawColor(192, 132, 252);
  doc.roundedRect(14, finalY + 10, 182, 32, 3, 3, 'FD');

  doc.setTextColor(107, 33, 168);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTANT PHONEPE & UPI PAYMENT INSTRUCTIONS:', 20, finalY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(58, 35, 92);
  doc.setFontSize(8.5);
  doc.text(
    `1. Open PhonePe, GPay, or Paytm app and scan the UPI QR code on Smart Billing dashboard or pay to VPA: grandhorizon@ybl`,
    20,
    finalY + 25
  );
  doc.text(
    `2. Mention Invoice Reference "${invoice.invoiceNumber || invoice.id}" in the payment note for immediate auto-reconciliation.`,
    20,
    finalY + 31
  );

  // Footer / Seal
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This document is an official computer-generated PDF tax invoice produced by Grand Horizon Hostel Smart Billing Systems.',
    14,
    finalY + 52
  );
  doc.text(
    'Grand Horizon Hostel Office, Plot 42, Hitech City Main Road, Hyderabad, Telangana 500081 • Support: billing@grandhorizon.com',
    14,
    finalY + 57
  );

  // Save File
  doc.save(`Invoice_${invoice.month}_${invoice.year}_Room${invoice.roomNumber}_${invoice.residentName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates a consolidated multi-page PDF package containing all invoices for a billing cycle
 */
export function generateCycleBatchPDF(invoices: Invoice[], month: string, year: number) {
  const doc = new jsPDF();

  // COVER / EXECUTIVE SUMMARY PAGE
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND HORIZON HOSTEL', 14, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`MONTHLY BILLING CYCLE STATEMENT PACKAGE — ${month.toUpperCase()} ${year}`, 14, 32);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} • Total Invoices: ${invoices.length}`, 14, 39);

  // Cycle Summary Metrics
  const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalUnpaid = totalAmount - totalPaid;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 52, 182, 30, 3, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Billing Cycle Overview (${month} ${year}):`, 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Billed: INR ${totalAmount.toLocaleString('en-IN')}`, 20, 72);
  doc.text(`Collected (Paid): INR ${totalPaid.toLocaleString('en-IN')}`, 85, 72);
  doc.text(`Outstanding Due: INR ${totalUnpaid.toLocaleString('en-IN')}`, 145, 72);

  // Summary Table
  const tableData = invoices.map((inv) => [
    inv.invoiceNumber || inv.id,
    inv.residentName,
    `Room ${inv.roomNumber}`,
    `INR ${(inv.rentAmount || 0).toLocaleString('en-IN')}`,
    `INR ${(inv.totalAmount || 0).toLocaleString('en-IN')}`,
    inv.dueDate || '10th',
    inv.status,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Invoice #', 'Resident', 'Room', 'Rent', 'Total (INR)', 'Due Date', 'Status']],
    body: tableData,
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  // Append individual invoice pages
  invoices.forEach((invoice) => {
    doc.addPage();

    // Individual Page Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND HORIZON HOSTEL', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`OFFICIAL INVOICE • ${invoice.month} ${invoice.year}`, 14, 26);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 145, 18);
    doc.text(`Room: ${invoice.roomNumber}`, 145, 26);

    // Bill To
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, 182, 32, 3, 3, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Resident: ${invoice.residentName}`, 20, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(`Room: Room ${invoice.roomNumber}`, 20, 61);
    doc.text(`Billing Cycle: ${invoice.month} ${invoice.year}`, 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${invoice.status}`, 120, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(`Due Date: ${invoice.dueDate || '10th of month'}`, 120, 61);

    autoTable(doc, {
      startY: 83,
      head: [['Description', 'Amount (INR)']],
      body: [
        [`Monthly Room Rent (${invoice.month} ${invoice.year})`, `INR ${(invoice.rentAmount || 0).toLocaleString('en-IN')}`],
        ['Electricity & Sub-meter Charges', `INR ${(invoice.electricityCharges || (invoice.electricityUnits || 0) * 10).toLocaleString('en-IN')}`],
        ['Water & Utilities', `INR ${(invoice.waterCharges || 0).toLocaleString('en-IN')}`],
        ['Fine / Late Fee', `INR ${(invoice.fine || 0).toLocaleString('en-IN')}`],
      ],
      foot: [['Total Payable Amount', `INR ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`]],
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    });
  });

  doc.save(`GrandHorizon_Billing_Cycle_PDF_Package_${month}_${year}.pdf`);
}

