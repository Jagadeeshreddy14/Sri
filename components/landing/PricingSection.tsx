'use client';

import React from 'react';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const tiers = [
    {
      name: 'Triple Sharing',
      price: '₹6,500',
      period: '/month',
      desc: 'Ideal for budget-conscious students seeking high quality dining & Wi-Fi.',
      features: [
        '3 Beds in Room',
        '4-Times Daily Mess Included',
        'High-Speed Wi-Fi Access',
        'Daily Housekeeping',
        '24/7 Security Access',
      ],
    },
    {
      name: 'Deluxe Twin Sharing',
      price: '₹8,500',
      period: '/month',
      desc: 'Our most popular tier balancing privacy, air conditioning & community.',
      popular: true,
      features: [
        '2 Beds in Room',
        'Inverter Air Conditioner',
        'Attached Washroom',
        '4-Times Daily Mess Included',
        'Dedicated Study Desks',
      ],
    },
    {
      name: 'Single Private Suite',
      price: '₹14,000',
      period: '/month',
      desc: 'Complete privacy with individual AC, personal balcony & attached bathroom.',
      features: [
        '1 Bed Private Room',
        'Personal Attached Bathroom',
        'Balcony / Garden View',
        'Full Power Backup',
        'Priority Maintenance SLA',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            No Hidden Fees. All-Inclusive Monthly Rent.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Security deposit equal to 1 month rent (refundable upon exit). All utilities included.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl border transition flex flex-col justify-between ${
                tier.popular
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className={`text-xs mt-1 ${tier.popular ? 'text-blue-100' : 'text-slate-500'}`}>{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className={`text-xs ${tier.popular ? 'text-blue-200' : 'text-slate-400'}`}>{tier.period}</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-200/20">
                  {tier.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-xs font-medium">
                      <Check className={`w-4 h-4 shrink-0 ${tier.popular ? 'text-white' : 'text-emerald-500'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
