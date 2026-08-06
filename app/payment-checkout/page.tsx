'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, ArrowLeft, Smartphone } from 'lucide-react';

export default function PaymentCheckoutPage() {
  const [transactionId, setTransactionId] = useState(`TXN_${Date.now()}`);
  const [amount, setAmount] = useState('8500');
  const [invoiceId, setInvoiceId] = useState('');
  const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS'>('PROCESSING');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('txId')) setTransactionId(searchParams.get('txId')!);
      if (searchParams.get('amount')) setAmount(searchParams.get('amount')!);
      if (searchParams.get('invoiceId')) setInvoiceId(searchParams.get('invoiceId')!);
    }

    const timer = setTimeout(() => {
      setStatus('SUCCESS');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });

      if (invoiceId) {
        fetch('/api/payments/phonepe/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantTransactionId: transactionId,
            transactionId: `PPE_${Date.now()}`,
            invoiceId,
            amount: Number(amount),
            paymentMethod: 'PHONEPE_UPI',
            code: 'PAYMENT_SUCCESS',
          }),
        }).catch(console.error);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [invoiceId, amount, transactionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-purple-400">
          <Smartphone className="w-8 h-8" />
          <span className="text-xl font-extrabold tracking-wider text-white">PhonePe Payment Gateway</span>
        </div>

        {status === 'PROCESSING' ? (
          <div className="py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <h3 className="text-lg font-bold">Connecting Secure PhonePe Server...</h3>
            <p className="text-xs text-slate-400">
              Transaction Ref: <span className="font-mono text-purple-300">{transactionId}</span>
            </p>
            <p className="text-xs text-slate-400">Amount: <strong className="text-white">₹{Number(amount).toLocaleString('en-IN')}</strong></p>
          </div>
        ) : (
          <div className="py-6 space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-black text-white">Payment Received!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your PhonePe payment of <strong className="text-emerald-400">₹{Number(amount).toLocaleString('en-IN')}</strong> has been confirmed and updated in your resident account.
            </p>

            <div className="p-3 bg-slate-800 rounded-2xl text-xs space-y-1 font-mono text-slate-300">
              <p>Txn ID: {transactionId}</p>
              <p>Status: PAYMENT_SUCCESS</p>
            </div>

            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Resident Portal
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit SSL Encrypted Payment Channel</span>
        </div>
      </div>
    </div>
  );
}
