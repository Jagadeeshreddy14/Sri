import React, { useState } from 'react';
import { Invoice } from '../../lib/types';
import { hostelStore } from '../../lib/store';
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Download,
  Send,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface InvoiceQrModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function InvoiceQrModal({
  invoice,
  isOpen,
  onClose,
  onPaymentSuccess,
}: InvoiceQrModalProps) {
  const [copied, setCopied] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  if (!isOpen || !invoice) return null;

  const upiVpa = 'grandhorizon@ybl';
  const merchantName = 'Grand Horizon Hostel';
  const amount = invoice.totalAmount || 0;
  const note = `Rent ${invoice.month} ${invoice.year} - ${invoice.invoiceNumber}`;

  // Standard UPI deep link format compatible with PhonePe, GPay, Paytm, BHIM
  const rawUpiString = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(
    merchantName
  )}&am=${amount}&tr=${invoice.invoiceNumber}&tn=${encodeURIComponent(note)}&cu=INR`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    rawUpiString
  )}`;

  const handleCopyUpiString = () => {
    navigator.clipboard.writeText(rawUpiString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSmsQr = async () => {
    setSmsSending(true);
    setSmsSuccess(null);
    try {
      const resident = hostelStore
        .getResidents()
        .find((r) => r.id === invoice.residentId || r.name === invoice.residentName);

      const phone = resident?.phone || '9876512345';
      const smsMessage = `Grand Horizon Hostel: Pay your rent invoice ${invoice.invoiceNumber} (₹${amount.toLocaleString(
        'en-IN'
      )}) instantly via PhonePe UPI ID ${upiVpa} or link: ${rawUpiString}`;

      await hostelStore.sendCustomSms(
        invoice.residentName,
        phone,
        smsMessage,
        'PAYMENT_DUE',
        'PhonePe QR Dispatcher'
      );

      setSmsSuccess(`PhonePe UPI payment link sent via SMS to ${phone}!`);
    } catch (e: any) {
      alert('Failed to send SMS: ' + e.message);
    } finally {
      setSmsSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setMarkingPaid(true);
    try {
      await fetch('/api/payments/phonepe/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantTransactionId: `QR_TXN_${Date.now()}`,
          transactionId: `PPE_QR_${Math.floor(100000 + Math.random() * 900000)}`,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: 'PHONEPE_QR',
          code: 'PAYMENT_SUCCESS',
        }),
      });

      hostelStore.processPhonePePayment(invoice.id);
      if (onPaymentSuccess) onPaymentSuccess();
      setTimeout(() => {
        setMarkingPaid(false);
        onClose();
      }, 800);
    } catch (e) {
      console.error(e);
      setMarkingPaid(false);
    }
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PhonePe UPI QR - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .qr-card { border: 2px solid #6b21a8; border-radius: 20px; padding: 30px; display: inline-block; max-width: 380px; }
            .title { color: #6b21a8; font-size: 22px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { color: #475569; font-size: 14px; margin-bottom: 20px; }
            .qr-img { width: 220px; height: 220px; margin: 15px 0; }
            .amount { font-size: 28px; font-weight: bold; color: #0f172a; margin: 10px 0; }
            .meta { font-size: 12px; color: #64748b; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="title">PhonePe UPI Payment</div>
            <div class="subtitle">Grand Horizon Hostel • Room ${invoice.roomNumber}</div>
            <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
            <img src="${qrImageUrl}" class="qr-img" alt="UPI QR" />
            <p>Scan with PhonePe, GPay, or Paytm</p>
            <div class="meta">
              Invoice #: <strong>${invoice.invoiceNumber}</strong><br/>
              Resident: <strong>${invoice.residentName}</strong><br/>
              Merchant UPI: <strong>${upiVpa}</strong>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                PhonePe UPI QR Code
              </h3>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                Unique Invoice Payment Terminal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Card */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase block">
              {invoice.residentName} (Room {invoice.roomNumber})
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Invoice #{invoice.invoiceNumber} • {invoice.month} {invoice.year}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">Total Payable</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-end gap-0.5">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              {amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* QR Display Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border-2 border-purple-500 shadow-md relative group flex items-center justify-center overflow-hidden">
            {!qrLoaded && (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                <span className="text-[10px] text-purple-600 font-bold">Rendering QR...</span>
              </div>
            )}
            <img
              src={qrImageUrl}
              alt={`PhonePe QR for ${invoice.invoiceNumber}`}
              onLoad={() => setQrLoaded(true)}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                qrLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="absolute inset-0 bg-purple-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-purple-900 pointer-events-none">
              PhonePe • GPay • Paytm
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Scan with PhonePe, Google Pay, or Paytm
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Merchant VPA: <span className="text-slate-700 dark:text-slate-300 font-bold">{upiVpa}</span>
            </p>
          </div>
        </div>

        {smsSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{smsSuccess}</span>
          </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyUpiString}
            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied UPI Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy UPI String
              </>
            )}
          </button>

          <button
            onClick={handleSendSmsQr}
            disabled={smsSending}
            className="py-2.5 px-3 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 border border-purple-200 dark:border-purple-800"
          >
            <Send className={`w-3.5 h-3.5 text-purple-600 ${smsSending ? 'animate-spin' : ''}`} />
            {smsSending ? 'Sending SMS...' : 'Send QR via SMS'}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handlePrintQr}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print QR
          </button>

          {invoice.status !== 'PAID' ? (
            <button
              onClick={handleMarkAsPaid}
              disabled={markingPaid}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className={`w-4 h-4 ${markingPaid ? 'animate-spin' : ''}`} />
              {markingPaid ? 'Confirming...' : 'Mark Paid via PhonePe QR'}
            </button>
          ) : (
            <div className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Received (PAID)
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
          <span>PhonePe Merchant Integration • Instant UPI Settlement</span>
        </div>
      </div>
    </div>
  );
}
