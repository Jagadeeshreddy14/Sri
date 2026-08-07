'use client';

import React, { useState } from 'react';
import { Invoice } from '../lib/types';
import {
  X,
  Smartphone,
  QrCode,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  IndianRupee,
} from 'lucide-react';

interface PhonePeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: () => void;
}

export default function PhonePeModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: PhonePeModalProps) {
  const [method, setMethod] = useState<'QR' | 'UPI_ID'>('QR');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setProcessingStep(1);

    const stepTimer1 = setTimeout(() => setProcessingStep(2), 600);
    const stepTimer2 = setTimeout(() => setProcessingStep(3), 1200);

    setTimeout(async () => {
      try {
        await fetch('/api/payments/phonepe/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantTransactionId: `TXN_${Date.now()}`,
            transactionId: `PPE_${Math.floor(100000 + Math.random() * 900000)}`,
            invoiceId: invoice.id,
            amount: invoice.totalAmount,
            paymentMethod: 'PHONEPE_UPI',
            code: 'PAYMENT_SUCCESS',
          }),
        });
      } catch (e) {
        console.error(e);
      } finally {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setIsProcessing(false);
        onSuccess();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">PhonePe UPI Gateway</h3>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Secure Merchant Checkout</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase">
              {invoice.month} {invoice.year} Rent
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">Room {invoice.roomNumber} • Grand Horizon</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">Total Amount</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-end gap-0.5">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              {(invoice.totalAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Processing Loading Overlay */}
        {isProcessing ? (
          <div className="py-8 space-y-6 text-center animate-fadeIn">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-indigo-600 border-b-purple-300 border-l-transparent animate-spin"></div>
              <Smartphone className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {processingStep === 1 && 'Connecting to PhonePe UPI Gateway...'}
                {processingStep === 2 && 'Awaiting User PIN & Bank Approval...'}
                {processingStep === 3 && 'Reconciling Ledger & Updating Invoice...'}
              </h4>
              <p className="text-xs text-slate-500">
                Please do not close or refresh this window while payment completes.
              </p>
            </div>

            {/* Animated Step Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-md"
                style={{
                  width: processingStep === 1 ? '35%' : processingStep === 2 ? '75%' : '100%',
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className={processingStep >= 1 ? 'text-purple-600' : ''}>1. Handshake</span>
              <span className={processingStep >= 2 ? 'text-purple-600' : ''}>2. Bank PIN</span>
              <span className={processingStep >= 3 ? 'text-purple-600' : ''}>3. Receipt</span>
            </div>
          </div>
        ) : (
          <>
            {/* Payment Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                onClick={() => setMethod('QR')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  method === 'QR'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" /> Scan PhonePe QR
              </button>
              <button
                onClick={() => setMethod('UPI_ID')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  method === 'UPI_ID'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Enter UPI ID
              </button>
            </div>

            {/* QR Code Tab */}
            {method === 'QR' ? (
              <div className="text-center space-y-3 py-2">
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-purple-500 shadow-inner flex flex-col items-center justify-center relative group">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=grandhorizon@ybl%26pn=Grand%20Horizon%20Hostel%26am=${invoice.totalAmount}`}
                    alt="PhonePe QR"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-purple-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-purple-900">
                    Scan with PhonePe
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open PhonePe, GPay, or Paytm on your smartphone to scan and pay directly.
                </p>
              </div>
            ) : (
              /* UPI ID Tab */
              <div className="space-y-3 py-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter VPA / UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@ybl or username@ibl"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  A collect request of ₹{invoice.totalAmount} will be pushed to your PhonePe mobile app.
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing || (method === 'UPI_ID' && !upiId)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" /> Approve & Pay ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
            </button>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>NPCI Unified Payments Interface • 256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
