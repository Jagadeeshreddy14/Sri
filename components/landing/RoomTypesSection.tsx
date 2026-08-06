'use client';

import React from 'react';
import { Bed, Users, Shield, Check, ArrowRight, IndianRupee } from 'lucide-react';

interface RoomTypesSectionProps {
  onSelectRoomCategory: () => void;
}

export default function RoomTypesSection({ onSelectRoomCategory }: RoomTypesSectionProps) {
  const roomCategories = [
    {
      title: 'Single AC Private Suite',
      price: '₹14,000',
      period: '/month',
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      features: [
        'Private Attached Bathroom',
        'Inverter Air Conditioner',
        'Study Table & Ergonomic Chair',
        'Spacious Full-Height Wardrobe',
        'Personal Balcony Access',
      ],
      popular: true,
    },
    {
      title: 'Deluxe Twin Sharing',
      price: '₹8,500',
      period: '/month per person',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      features: [
        'Shared Attached Bathroom',
        'Inverter Air Conditioner',
        '2 Separate Study Desks',
        'Individual Locker Wardrobes',
        'High-Speed Wi-Fi Router',
      ],
      popular: false,
    },
    {
      title: 'Standard Triple Sharing',
      price: '₹6,500',
      period: '/month per person',
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      features: [
        'Spacious Room Layout',
        'Air Cooler / Ceiling Fans',
        '3 Independent Study Desks',
        'Keyed Storage Cabinets',
        'Daily Room Housekeeping',
      ],
      popular: false,
    },
  ];

  return (
    <section id="rooms" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Accommodation Options
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Choose Your Ideal Room Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            All plans include 4 meals daily, high-speed internet, power backup, and regular housekeeping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roomCategories.map((room, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border overflow-hidden transition flex flex-col justify-between ${
                room.popular
                  ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/20 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                  {room.popular && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white font-extrabold text-[10px] uppercase rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{room.title}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{room.price}</span>
                      <span className="text-xs text-slate-400 font-medium">{room.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {room.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onSelectRoomCategory}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    room.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Book This Room <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
