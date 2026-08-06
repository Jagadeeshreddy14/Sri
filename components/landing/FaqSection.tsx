'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is included in the monthly rent package?',
      a: 'All plans include 3 meals daily (breakfast, lunch, dinner), electricity allowance, high-speed 1 Gbps fiber Wi-Fi, daily room housekeeping, 24/7 security, and access to study lounges and gym facilities.',
    },
    {
      q: 'How does online bill payment via PhonePe work?',
      a: 'Residents log into their resident dashboard where generated monthly invoices appear. Clicking "Pay Now" seamlessly launches the PhonePe gateway integration supporting UPI, credit/debit cards, and net banking.',
    },
    {
      q: 'What is the security deposit and refund policy?',
      a: 'A refundable security deposit equal to 1 month rent is required at check-in. The deposit is refunded within 3 working days upon completion of the room exit inspection.',
    },
    {
      q: 'How are maintenance requests handled?',
      a: 'Residents submit maintenance issues directly via their resident portal. Staff members receive real-time notifications and resolve requests usually within 4 to 24 hours depending on priority.',
    },
    {
      q: 'Are visitors permitted inside the rooms?',
      a: 'Family members and guests are allowed in the common reception lounge between 9:00 AM and 7:00 PM. Room entries require warden approval for safety compliance.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Clear Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Everything you need to know about resident rules, payments, and campus life.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
