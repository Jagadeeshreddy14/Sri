'use client';

import React from 'react';
import { Building, Shield, Heart, Award, Check } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              About Grand Horizon
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Home Away From Home Engineered for Comfort & Peace of Mind
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Founded in 2021, Grand Horizon Hostel is built to bridge the gap between academic/professional hustle and comfortable living. We manage state-of-the-art residential complexes providing clean dining, climate control, automated billing, and diligent housekeeping.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Strict Hygiene & Daily Sanitization</h4>
                  <p className="text-xs text-slate-500">Dedicated housekeeping team cleans rooms, washrooms, and common corridors every day.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hygienic 4-Time Mess Meal Service</h4>
                  <p className="text-xs text-slate-500">Nutritious North & South Indian meals prepared by experienced chefs with weekly menu rotations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Maintenance Stress</h4>
                  <p className="text-xs text-slate-500">Report plumbing or electrical issues directly via our mobile resident dashboard for quick technician response.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
              alt="Cozy Room"
              className="rounded-3xl object-cover h-64 w-full shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
              alt="Study Lounge"
              className="rounded-3xl object-cover h-64 w-full shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
