'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: 'Rohan Verma',
      role: 'Software Engineer at TechCorp',
      comment: 'Living at Grand Horizon has been a blessing. Fast Wi-Fi for remote work, zero laundry hassles, and the PhonePe auto-rent payment system takes 10 seconds every month.',
      rating: 5,
      room: 'Room 204 (Deluxe Twin)',
    },
    {
      name: 'Ananya Roy',
      role: 'Final Year Medical Student',
      comment: 'Super peaceful environment for late-night study sessions. The warden and staff are extremely helpful and maintenance issues get resolved the same day.',
      rating: 5,
      room: 'Room 102 (Single AC)',
    },
    {
      name: 'Priya Sundaram',
      role: 'CA Aspirant',
      comment: 'The food quality here is unmatched! 4 fresh meals daily, clean drinking water filters, and biometric security gives my parents complete peace of mind.',
      rating: 5,
      room: 'Room 305 (Standard Triple)',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Resident Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by Students & Young Professionals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                  <p className="text-[10px] text-slate-500">{rev.role}</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{rev.room}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
