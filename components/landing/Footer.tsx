'use client';

import React from 'react';
import { Building2, Heart, ShieldCheck, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-wide">
                Grand Horizon
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier student and working professional accommodation system. Combining luxury, high safety, and digital-first hostel management.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-blue-400 transition">About Campus</a></li>
              <li><a href="#facilities" className="hover:text-blue-400 transition">Facilities</a></li>
              <li><a href="#rooms" className="hover:text-blue-400 transition">Room Pricing</a></li>
              <li><a href="#gallery" className="hover:text-blue-400 transition">Photo Gallery</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition">Book Tour</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Resident Portal</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-400">Online Rent Payment (PhonePe)</span></li>
              <li><span className="text-slate-400">Maintenance Request Log</span></li>
              <li><span className="text-slate-400">Digital Mess Menu & Announcements</span></li>
              <li><span className="text-slate-400">Instant PDF Receipt Download</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Contact & Support</h4>
            <div className="space-y-2">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> support@grandhorizon.com</p>
              <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Security Gate Control</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Grand Horizon Luxury Hostel Management System. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Powered by Next.js, Tailwind CSS & PhonePe Integration
          </p>
        </div>
      </div>
    </footer>
  );
}
