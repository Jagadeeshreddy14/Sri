import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './types';

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 58, 138); // Blue-900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND HORIZON HOSTEL', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL RENT RECEIPT & INVOICE', 14, 30);
  doc.text(`Receipt ID: ${invoice.id}`, 145, 22);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 30);

  // Bill To Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 14, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Resident: ${invoice.residentName}`, 14, 60);
  doc.text(`Room Allocated: Room ${invoice.roomNumber}`, 14, 67);
  doc.text(`Billing Period: ${invoice.month} ${invoice.year}`, 14, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', 130, 52);
  doc.setTextColor(invoice.status === 'PAID' ? 16 : 180, invoice.status === 'PAID' ? 185 : 50, invoice.status === 'PAID' ? 129 : 50);
  doc.text(invoice.status, 130, 60);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 130, 67);
  if (invoice.transactionId) {
    doc.text(`Txn Ref: ${invoice.transactionId}`, 130, 74);
  }

  // Breakdown Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Category', 'Amount (INR)']],
    body: [
      [`Monthly Room Accommodation Fee (${invoice.month} ${invoice.year})`, 'Rent', `INR ${(invoice.rentAmount || 0).toLocaleString('en-IN')}`],
      ['Utility Charges (Water, High-Speed Wi-Fi & Electricity)', 'Utilities', `INR ${(invoice.utilityAmount || 0).toLocaleString('en-IN')}`],
    ],
    foot: [['Total Payable Amount', '', `INR ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`]],
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    theme: 'grid',
  });

  // Stamp / Signature
  const finalY = (doc as any).lastAutoTable.finalY || 130;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated tax invoice and requires no physical signature.', 14, finalY + 20);
  doc.text('Grand Horizon Hostel Management Systems • Helpline: +91 98765 43210', 14, finalY + 26);

  // Save File
  doc.save(`Invoice_${invoice.month}_${invoice.year}_${invoice.residentName.replace(/\s+/g, '_')}.pdf`);
}
