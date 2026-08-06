'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Invoice, MaintenanceRequest, Room, Notification } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import PhonePeModal from '@/components/PhonePeModal';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import confetti from 'canvas-confetti';
import {
  Home,
  Receipt,
  Wrench,
  Bell,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  Wifi,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Send,
  IndianRupee,
  User,
  Bed,
} from 'lucide-react';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // PhonePe Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPhonePeOpen, setIsPhonePeOpen] = useState(false);

  // Maintenance Form
  const [mTitle, setMTitle] = useState('');
  const [mCategory, setMCategory] = useState<'Plumbing' | 'Electrical' | 'Wi-Fi' | 'Furniture' | 'Cleaning'>('Plumbing');
  const [mDesc, setMDesc] = useState('');
  const [mPriority, setMPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [mSubmitting, setMSubmitting] = useState(false);
  const [mSuccessMsg, setMSuccessMsg] = useState<string | null>(null);

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      const [invRes, mainRes, notifRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/maintenance'),
        fetch('/api/notifications'),
      ]);

      let invs: Invoice[] | null = null;
      let m: MaintenanceRequest[] | null = null;
      let notifs: Notification[] | null = null;

      if (invRes.ok) invs = await invRes.json();
      if (mainRes.ok) m = await mainRes.json();
      if (notifRes.ok) notifs = await notifRes.json();

      const finalInvs = Array.isArray(invs) ? invs : hostelStore.getInvoices();
      const finalM = Array.isArray(m) ? m : hostelStore.getMaintenance();
      const finalNotifs = Array.isArray(notifs) ? notifs : hostelStore.getNotifications();

      setInvoices(finalInvs.filter((i) => i.residentId === user?.id || user?.role === 'resident'));
      setMaintenance(finalM.filter((i) => i.residentId === user?.id || user?.role === 'resident'));
      setNotifications(finalNotifs);
    } catch (e) {
      console.error(e);
      const finalInvs = hostelStore.getInvoices();
      const finalM = hostelStore.getMaintenance();
      setInvoices(finalInvs.filter((i) => i.residentId === user?.id || user?.role === 'resident'));
      setMaintenance(finalM.filter((i) => i.residentId === user?.id || user?.role === 'resident'));
      setNotifications(hostelStore.getNotifications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentData();
  }, [user]);

  const handlePayClick = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPhonePeOpen(true);
  };

  const handlePaymentSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIsPhonePeOpen(false);
    fetchResidentData();
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setMSubmitting(true);
    setMSuccessMsg(null);

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId: user?.id,
          residentName: user?.name,
          roomId: user?.roomId || 'room-101',
          roomNumber: user?.roomNumber || '101',
          title: mTitle,
          category: mCategory,
          description: mDesc,
          priority: mPriority,
        }),
      });

      if (res.ok) {
        setMTitle('');
        setMDesc('');
        setMSuccessMsg('Maintenance request submitted successfully! Staff notified.');
        fetchResidentData();
        setTimeout(() => setMSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingInvoice = invoices.find((i) => i.status === 'PENDING' || i.status === 'OVERDUE');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-xl font-bold text-blue-300">
            {user?.name?.charAt(0) || 'R'}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Resident Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">Welcome, {user?.name}</h1>
            <p className="text-xs text-slate-300">Room {user?.roomNumber || '101'} • Bed A • Grand Horizon Hostel</p>
          </div>
        </div>

        {pendingInvoice && (
          <button
            onClick={() => handlePayClick(pendingInvoice)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Pay Current Rent (₹{(pendingInvoice.totalAmount || 0).toLocaleString('en-IN')})
          </button>
        )}
      </div>

      {/* Room Overview & Wifi Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Room Allocation</span>
            <Bed className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Room {user?.roomNumber || '101'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Twin Sharing Deluxe • Floor 1</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Campus Wi-Fi</span>
            <Wifi className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">GrandHorizon_Resident</h3>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1">Pass: Fiber1Gbps#2026</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Warden Hotline</span>
            <Phone className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">+91 98765 43210</h3>
            <p className="text-xs text-slate-500 mt-1">Available 24/7 for Gate Pass & Emergency</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Invoices & Payment History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Monthly Rent Invoices
              </h3>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No invoices issued yet.</p>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {inv.month} {inv.year} Rent
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                      {inv.status === 'PENDING' || inv.status === 'OVERDUE' ? (
                        <button
                          onClick={() => handlePayClick(inv)}
                          className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay PhonePe
                        </button>
                      ) : (
                        <button
                          onClick={() => generateInvoicePDF(inv)}
                          className="mt-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-xl transition inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maintenance Status Feed */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> My Maintenance Tickets
            </h3>

            <div className="space-y-3">
              {maintenance.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active maintenance tickets logged.</p>
              ) : (
                maintenance.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">"{m.description}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Category: {m.category}</span>
                      <span>Assigned: {m.assignedStaffName || 'In Queue'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Create Maintenance Request & Announcements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submit Maintenance Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Raise Maintenance Issue
            </h3>

            {mSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-medium">
                {mSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateMaintenance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Category</label>
                <select
                  value={mCategory}
                  onChange={(e: any) => setMCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="Plumbing">Plumbing / Tap Leak</option>
                  <option value="Electrical">Electrical / Light / AC</option>
                  <option value="Wi-Fi">Wi-Fi Router Connection</option>
                  <option value="Furniture">Furniture / Bed / Lock</option>
                  <option value="Cleaning">Housekeeping & Sanitization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  placeholder="e.g. Bathroom shower knob leaking"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows={2}
                  required
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  placeholder="Describe where and when the issue occurs..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Urgency Priority</label>
                <select
                  value={mPriority}
                  onChange={(e: any) => setMPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="LOW">LOW (Can fix in 24 hours)</option>
                  <option value="MEDIUM">MEDIUM (Needs fix today)</option>
                  <option value="HIGH">HIGH (Urgent water/electric safety)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={mSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Request
              </button>
            </form>
          </div>

          {/* Announcements Feed */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" /> Warden Announcements
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-purple-500 font-normal">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PHONEPE MODAL */}
      {selectedInvoice && (
        <PhonePeModal
          isOpen={isPhonePeOpen}
          onClose={() => setIsPhonePeOpen(false)}
          invoice={selectedInvoice}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
