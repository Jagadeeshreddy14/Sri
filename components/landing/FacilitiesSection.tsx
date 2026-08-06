'use client';

import React from 'react';
import {
  Wifi,
  ShieldCheck,
  Coffee,
  Sparkles,
  Zap,
  Tv,
  AirVent,
  Shirt,
  Flame,
  KeyRound,
} from 'lucide-react';

export default function FacilitiesSection() {
  const facilities = [
    {
      icon: <Wifi className="w-6 h-6 text-blue-600" />,
      title: '1Gbps Fiber Wi-Fi',
      desc: 'Dedicated routers on every floor ensuring uninterrupted online classes, work calls, and streaming.',
    },
    {
      icon: <Coffee className="w-6 h-6 text-amber-600" />,
      title: '4-Times Mess Dining',
      desc: 'Breakfast, Lunch, Evening Snacks with Tea/Coffee, and Dinner cooked fresh daily with local organic ingredients.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Biometric Gate Security',
      desc: 'Smart card & fingerprint attendance entry with 24/7 CCTV surveillance and resident wardens.',
    },
    {
      icon: <AirVent className="w-6 h-6 text-cyan-600" />,
      title: 'Air Conditioning Units',
      desc: 'Energy-efficient inverter ACs in every single and deluxe room for year-round temperature comfort.',
    },
    {
      icon: <Shirt className="w-6 h-6 text-purple-600" />,
      title: 'Automated Laundry Service',
      desc: 'In-house commercial washing machines and steam ironing facilities available twice weekly.',
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: '24/7 Power Backup',
      desc: 'High-capacity silent diesel generators ensure zero power outages for studies and laptops.',
    },
    {
      icon: <Flame className="w-6 h-6 text-rose-500" />,
      title: '24/7 Hot Water Geysers',
      desc: 'Solar and electrical water heating systems for instant hot showers during cold mornings.',
    },
    {
      icon: <Tv className="w-6 h-6 text-indigo-500" />,
      title: 'Recreation & Gaming Hub',
      desc: 'Common lounge equipped with 65" 4K Smart TV, PlayStation 5, Table Tennis, and indoor games.',
    },
  ];

  return (
    <section id="facilities" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            World-Class Amenities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need for a Seamless Living Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed with attention to detail so you can focus on your career and studies while we handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {fac.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{fac.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{fac.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
