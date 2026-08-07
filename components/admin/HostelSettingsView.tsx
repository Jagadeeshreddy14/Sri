'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileText,
  BadgePercent,
  Calendar,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { hostelStore } from '../../lib/store';
import { HostelInfo } from '../../lib/types';

export default function HostelSettingsView() {
  const [formData, setFormData] = useState<HostelInfo>({
    name: 'Grand Horizon',
    tagline: 'Premium Student & Professional Co-Living Hostel',
    address: 'Plot 42, Innovation Corridor, Cyber City, Hyderabad, 500081',
    phone: '+91 98765 43210',
    email: 'support@grandhorizonhostel.com',
    establishedYear: '2021',
    gstin: '36AAAAA0000A1Z5',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const current = hostelStore.getHostelInfo();
    if (current) {
      setFormData(current);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (successMsg) setSuccessMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    hostelStore.updateHostelInfo(formData);

    setTimeout(() => {
      setSaving(false);
      setSuccessMsg(`Hostel name updated to "${formData.name.trim()}" across the entire application!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }, 400);
  };

  const handleReset = () => {
    const defaultData: HostelInfo = {
      name: 'Grand Horizon',
      tagline: 'Premium Student & Professional Co-Living Hostel',
      address: 'Plot 42, Innovation Corridor, Cyber City, Hyderabad, 500081',
      phone: '+91 98765 43210',
      email: 'support@grandhorizonhostel.com',
      establishedYear: '2021',
      gstin: '36AAAAA0000A1Z5',
    };
    setFormData(defaultData);
    hostelStore.updateHostelInfo(defaultData);
    setSuccessMsg('Settings reset to default Grand Horizon Hostel parameters.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-widest text-blue-100">
            <Building2 className="w-3.5 h-3.5 text-blue-200" /> Admin Settings
          </div>
          <h2 className="text-2xl font-black tracking-tight">Hostel Name & Identity Settings</h2>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Customize your property name, branding subtitle, contact information, and registration details. Changes apply instantly across the Navbar, resident portals, invoice headers, and SMS notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 border border-white/20"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Primary Hostel Identity
              </h3>
              <p className="text-xs text-slate-500">
                This name will be displayed as your main property title throughout the software.
              </p>
            </div>

            {/* Hostel Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Hostel Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Grand Horizon Hostel, Royal Residency, Cyber Heights PG"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Tagline Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Branding Subtitle / Tagline
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Premium Student & Working Professional Co-Living"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Official Contact & Location Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Support Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="support@hosteldomain.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Property Physical Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Plot Number, Street, Landmark, City, Pincode"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Established Year */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Established Year
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="establishedYear"
                      value={formData.establishedYear || ''}
                      onChange={handleChange}
                      placeholder="2021"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* GSTIN */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    GSTIN / Tax ID (For Receipts)
                  </label>
                  <div className="relative">
                    <BadgePercent className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin || ''}
                      onChange={handleChange}
                      placeholder="36AAAAA0000A1Z5"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-mono border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Save Button */}
            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Hostel Name & Info'}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Preview Sidebar */}
        <div className="space-y-6">
          {/* Navbar Header Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Live Navbar Preview
            </h4>

            <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                    {formData.name || 'Your Hostel Name'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-1 block truncate max-w-[200px]">
                    {formData.tagline || 'Hostel Management System'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Receipt Header Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" /> Invoice Header Preview
            </h4>

            <div className="p-4 bg-amber-50/40 dark:bg-slate-800/60 rounded-2xl border border-amber-200/50 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {formData.name || 'Your Hostel Name'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {formData.address || 'Address line'}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded-full">
                  OFFICIAL RECEIPT
                </span>
              </div>
              <div className="pt-2 border-t border-amber-200/50 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-400 flex flex-col gap-0.5 font-mono">
                <span>Phone: {formData.phone}</span>
                <span>Email: {formData.email}</span>
                {formData.gstin && <span>GSTIN: {formData.gstin}</span>}
              </div>
            </div>
          </div>

          {/* SMS Notification Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-purple-600" /> SMS Branding Prefix
            </h4>

            <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed border border-slate-800 space-y-1">
              <p className="text-amber-400 font-bold">
                [{formData.name || 'Your Hostel'}]
              </p>
              <p className="text-slate-300">
                Dear Resident, your monthly rent invoice of ₹8,500 for Room 101 is now generated. Please visit your portal to view receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
