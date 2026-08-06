'use client';

import React from 'react';
import {
  Building2,
  ShieldCheck,
  Wifi,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Bed,
  PhoneCall,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onOpenAdminPortal: () => void;
}

export default function HeroSection({
  onOpenAuth,
  onOpenAdminPortal,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Premium Luxury Student & Working Professional Living</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Elevated Living at <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Grand Horizon Hostel
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experience modern, safe, and fully furnished accommodation equipped with high-speed fiber Wi-Fi, biometric security, chef-curated meals, automated PhonePe rent collection, and 24/7 maintenance support.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Resident Login & Book Room <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAdminPortal}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Admin / Warden Portal
              </button>
            </div>

            {/* Highlight Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">120+</span>
                <p className="text-xs text-slate-500 font-medium">Luxury Air-Conditioned Rooms</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">99.8%</span>
                <p className="text-xs text-slate-500 font-medium">Resident Satisfaction Rate</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">24/7</span>
                <p className="text-xs text-slate-500 font-medium">Biometric Gate Security</p>
              </div>
            </div>
          </div>

          {/* Right Showcase Card Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"
                alt="Grand Horizon Hostel Interior"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-extrabold uppercase rounded-full w-max">
                  Grand Horizon Main Wing
                </span>
                <h3 className="text-xl font-bold">Designer Twin-Sharing Deluxe Suite</h3>
                <p className="text-xs text-slate-300">
                  Fully furnished with ergonomic study desks, individual wardrobe locks, attached washrooms & high-speed Wi-Fi router in every room.
                </p>
              </div>
            </div>

            {/* Floating Info Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">PhonePe Auto Rent Invoicing</p>
                <p className="text-[10px] text-slate-500">Instant PDF Receipts & SMS Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
