'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomType: 'Single',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', roomType: 'Single', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Schedule A Hostel Visit or Inquire Online
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Have questions about room availability, mess menus, or admission rules? Fill out the form or reach out directly to our warden team.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Address</h4>
                  <p className="text-xs text-slate-500 mt-0.5">42 Knowledge Park III, Tech Hub City, KA 560103</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Phone & WhatsApp</h4>
                  <p className="text-xs text-slate-500 mt-0.5">+91 98765 43210 / +91 98765 43211</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Inquiries</h4>
                  <p className="text-xs text-slate-500 mt-0.5">admissions@grandhorizon.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiry Received!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out. Our admissions counselor will call you within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Book a Tour / Admission Query</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="aarav@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="10-digit mobile"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Room Category</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Single">Single Private Room</option>
                      <option value="Double">Twin Sharing Deluxe</option>
                      <option value="Triple">Triple Sharing Economy</option>
                      <option value="Deluxe">Executive Deluxe Studio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message / Specific Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tell us your expected move-in date or questions..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
