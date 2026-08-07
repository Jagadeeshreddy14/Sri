'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, PaymentSettings } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import { generateInvoicePDF, generateCycleBatchPDF } from '@/lib/pdf-generator';
import InvoiceQrModal from '@/components/admin/InvoiceQrModal';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  FileText,
  Calendar,
  X,
  CreditCard,
  RefreshCw,
  QrCode,
  Zap,
  AlertTriangle,
  Send,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  BellRing,
  Check,
  ShieldAlert,
  Settings,
  Building,
  Landmark,
} from 'lucide-react';

function TableSkeletonLoader() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0"></div>
              <div className="space-y-2">
                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
            <div className="hidden sm:block space-y-1.5">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="h-2.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md ml-auto"></div>
              <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md ml-auto"></div>
            </div>
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SmartBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Recurring Billing Schedule state
  const [recurringBilling, setRecurringBilling] = useState(
    hostelStore.getRecurringBillingSettings()
  );

  // Notifications & Twilio SMS Sending state
  const [smsNotificationMsg, setSmsNotificationMsg] = useState<string | null>(null);
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // Generate Invoice Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // PhonePe UPI QR Modal State
  const [selectedQrInvoice, setSelectedQrInvoice] = useState<Invoice | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Payment Settings Modal State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(
    hostelStore.getPaymentSettings()
  );
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = useState(false);
  const [paymentSettingsSuccess, setPaymentSettingsSuccess] = useState<string | null>(null);

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = hostelStore.updatePaymentSettings(paymentSettings);
    setPaymentSettings(updated);
    setPaymentSettingsSuccess('Payment gateway & billing policy settings saved successfully!');
    setTimeout(() => setPaymentSettingsSuccess(null), 3500);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setInvoices(hostelStore.getInvoices());
    setLoading(false);
  };

  const handleRefreshInvoices = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchInvoices();
    setRecurringBilling(hostelStore.getRecurringBillingSettings());
  }, []);

  const handleToggleRecurringBilling = () => {
    const updated = hostelStore.toggleRecurringBilling();
    setRecurringBilling({ ...updated });
    setSmsNotificationMsg(
      updated.enabled
        ? '⚡ Recurring billing schedule ENABLED: Rent invoices will automatically generate on the 1st of every month.'
        : '⏸️ Recurring billing schedule PAUSED by admin.'
    );
    setTimeout(() => setSmsNotificationMsg(null), 6000);
  };

  const handleGenerateInvoices = async () => {
    setGenerating(true);
    setGenerateResult(null);
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: Number(selectedYear) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGenerateResult(data.message);
      fetchInvoices();
    } catch (err: any) {
      setGenerateResult(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendSmsReminder = async (inv: Invoice) => {
    setSendingSmsId(inv.id);
    try {
      const res = await hostelStore.sendInvoiceSmsReminder(inv.id, 'Smart Billing Quick Action');
      setSmsNotificationMsg(
        `📱 Twilio SMS Payment Reminder successfully sent to ${inv.residentName}!`
      );
      setTimeout(() => setSmsNotificationMsg(null), 6000);
    } catch (e: any) {
      alert('Failed to send SMS reminder: ' + e.message);
    } finally {
      setSendingSmsId(null);
    }
  };

  const handleBulkSmsOverdueReminders = async () => {
    const overdueList = invoices.filter((i) => {
      const isPastDue = i.dueDate && new Date(i.dueDate) < new Date();
      return i.status === 'OVERDUE' || (i.status === 'PENDING' && isPastDue);
    });

    if (overdueList.length === 0) {
      alert('No overdue invoices found to dispatch reminders.');
      return;
    }

    setBulkSending(true);
    let count = 0;
    for (const inv of overdueList) {
      try {
        await hostelStore.sendInvoiceSmsReminder(inv.id, 'Bulk Overdue SMS Engine');
        count++;
      } catch (e) {
        console.error(e);
      }
    }
    setBulkSending(false);
    setSmsNotificationMsg(
      `🚨 Bulk Twilio SMS Overdue Reminders successfully dispatched to ${count} resident(s)!`
    );
    setTimeout(() => setSmsNotificationMsg(null), 7000);
  };

  const handleDownloadPDF = (inv: Invoice) => {
    generateInvoicePDF(inv);
  };

  const handleDownloadCycleBatchPDF = () => {
    if (invoices.length === 0) {
      alert('No invoices available to generate PDF package.');
      return;
    }
    const currentMonth = invoices[0]?.month || 'August';
    const currentYear = invoices[0]?.year || 2026;
    generateCycleBatchPDF(filteredInvoices.length > 0 ? filteredInvoices : invoices, currentMonth, currentYear);
  };

  const overdueInvoices = invoices.filter((inv) => {
    const isPastDue = inv.dueDate && new Date(inv.dueDate) < new Date();
    return inv.status === 'OVERDUE' || (inv.status === 'PENDING' && isPastDue);
  });

  const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const isPastDue = inv.dueDate && new Date(inv.dueDate) < new Date();
    const effectiveStatus = (inv.status === 'PENDING' && isPastDue) ? 'OVERDUE' : inv.status;

    const matchesStatus = statusFilter === 'All' || effectiveStatus === statusFilter;
    const matchesQuery =
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.residentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.roomNumber && inv.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" /> Smart Billing & Automated Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate monthly rent bills, schedule recurring billing on the 1st of every month, track PhonePe payments, and send SMS reminders via Twilio.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoices.length > 0 && (
            <>
              <button
                onClick={handleDownloadCycleBatchPDF}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                title="Download consolidated PDF package for all invoices in this billing cycle"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Download Cycle PDFs
              </button>
              <button
                onClick={() => {
                  const target = invoices.find((i) => i.status !== 'PAID') || invoices[0];
                  setSelectedQrInvoice(target);
                  setIsQrModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-purple-500"
              >
                <QrCode className="w-4 h-4" /> Generate QR
              </button>
            </>
          )}
          <button
            onClick={() => setIsPaymentSettingsModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-500"
            title="Configure Payment Gateways, UPI Merchant details, and Late Fee rules"
          >
            <Settings className="w-4 h-4" /> Payment Settings
          </button>
          <button
            onClick={() => {
              setIsGenerateModalOpen(true);
              setGenerateResult(null);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Batch Generate Monthly Invoices
          </button>
        </div>
      </div>

      {/* SMS Alert Toast Banner */}
      {smsNotificationMsg && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{smsNotificationMsg}</span>
          </div>
          <button
            onClick={() => setSmsNotificationMsg(null)}
            className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RECURRING BILLING CONTROL CARD */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-blue-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-1.5 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Automated Schedule
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                recurringBilling.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-700 text-slate-300 border border-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  recurringBilling.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                }`}
              ></span>
              {recurringBilling.enabled ? 'Active (1st of Every Month)' : 'Schedule Paused'}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            Monthly Recurring Billing Generator
          </h3>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            Automatically generates rent invoices for active residents on the{' '}
            <strong className="text-white font-black">1st day of every month at 00:00 AM</strong>. Automatically integrates with Twilio SMS dispatch & PhonePe payment tracking.
          </p>

          <div className="pt-1 flex items-center gap-4 text-[11px] text-blue-200">
            <span>
              Next Scheduled Batch:{' '}
              <strong className="text-amber-300 font-extrabold">
                {recurringBilling.nextRunDate || '2026-09-01'} (00:00 AM)
              </strong>
            </span>
            <span>•</span>
            <span>
              Last Batch Executed:{' '}
              <strong className="text-emerald-300 font-bold">
                {recurringBilling.lastRunDate || '2026-08-01'}
              </strong>
            </span>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-blue-800/60 pt-3 md:pt-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold block text-blue-200">
              Recurring Toggle
            </span>
            <span className="text-[10px] text-blue-300">
              {recurringBilling.enabled ? 'Auto-runs on 1st' : 'Manual mode only'}
            </span>
          </div>

          <button
            onClick={handleToggleRecurringBilling}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 shadow-lg ${
              recurringBilling.enabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/40'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {recurringBilling.enabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-200" /> Recurring Active
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-400" /> Enable Recurring
              </>
            )}
          </button>
        </div>
      </div>

      {/* OVERDUE PAYMENTS WARNING BADGE & BULK SMS BAR */}
      {overdueInvoices.length > 0 && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white tracking-wider">
                  ⚠️ WARNING BADGE: OVERDUE PAYMENTS
                </span>
                <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                  {overdueInvoices.length} Resident Invoice(s) Overdue
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Total unpaid overdue rent amount:{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
                  ₹{totalOverdueAmount.toLocaleString('en-IN')}
                </strong>
                . Quick-action dispatch available below.
              </p>
            </div>
          </div>

          <button
            onClick={handleBulkSmsOverdueReminders}
            disabled={bulkSending}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 border border-rose-500 shrink-0"
          >
            <Send className={`w-4 h-4 ${bulkSending ? 'animate-spin' : ''}`} />
            {bulkSending ? 'Dispatching Twilio SMS...' : `Send SMS Reminders to All Overdue (${overdueInvoices.length})`}
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, resident or room..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefreshInvoices}
            disabled={refreshing || loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="All">All Invoices</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue (Warning)</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <TableSkeletonLoader />
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Invoices Found</h3>
          <p className="text-xs text-slate-500">
            Click batch generate or enable recurring billing to automatically generate invoices.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status & Indicators</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions & Twilio SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const isPastDue = inv.dueDate && new Date(inv.dueDate) < new Date();
                  const isOverdue = inv.status === 'OVERDUE' || (inv.status === 'PENDING' && isPastDue);

                  return (
                    <tr
                      key={inv.id}
                      className={`transition ${
                        isOverdue
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-l-4 border-l-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {inv.residentName}
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        Room {inv.roomNumber}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {inv.month} {inv.year}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                        {(inv.fine || 0) > 0 && (
                          <span className="block text-[9px] text-rose-500 font-extrabold">
                            Includes ₹{inv.fine} late fee
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                            {inv.dueDate
                              ? new Date(inv.dueDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Status Column with OVERDUE Warning Badge */}
                      <td className="py-4 px-4">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-sm animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            OVERDUE BADGE
                          </span>
                        ) : inv.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Quick Actions & Twilio SMS Reminder */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* QUICK ACTION: SMS REMINDER VIA TWILIO */}
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => handleSendSmsReminder(inv)}
                              disabled={sendingSmsId === inv.id}
                              className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 font-extrabold text-[11px] shadow-sm border ${
                                isOverdue
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
                                  : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              }`}
                              title="Send SMS Payment Reminder via Twilio integration"
                            >
                              <MessageSquare
                                className={`w-3.5 h-3.5 ${
                                  sendingSmsId === inv.id
                                    ? 'animate-spin'
                                    : isOverdue
                                    ? 'text-white'
                                    : 'text-amber-600'
                                }`}
                              />
                              {sendingSmsId === inv.id ? 'Sending SMS...' : 'Send SMS Reminder'}
                            </button>
                          )}

                          {/* PHONEPE QR GENERATOR */}
                          <button
                            onClick={() => {
                              setSelectedQrInvoice(inv);
                              setIsQrModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl transition flex items-center gap-1 font-extrabold text-[11px]"
                            title="Generate PhonePe UPI QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-purple-600" /> Generate QR
                          </button>

                          {/* DOWNLOAD PDF RECEIPT */}
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                            title="Download PDF Receipt"
                          >
                            <Download className="w-3.5 h-3.5" /> Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BATCH GENERATE INVOICES MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Batch Invoice Generator
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generating ? (
              <div className="py-6 space-y-4 text-center animate-fadeIn">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900 animate-ping opacity-60"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin"></div>
                  <Zap className="w-7 h-7 text-amber-500 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Running Monthly Rent Engine...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Scanning active resident contracts, calculating utility meters & generating PhonePe tokens...
                  </p>
                </div>

                {/* Animated Step Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full animate-pulse transition-all duration-700 w-4/5 shadow-md"></div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="text-blue-600">1. Resident Audit</span>
                  <span className="text-blue-600">2. Sub-meters</span>
                  <span className="text-blue-600">3. Invoices & QR</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This process scans all active residents with allocated rooms and generates monthly invoices. Duplicate invoices for the same month/year are automatically prevented.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Billing Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Billing Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>

                {generateResult && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs rounded-xl font-medium space-y-2">
                    <p>{generateResult}</p>
                    <button
                      onClick={() => {
                        const cycleInvoices = invoices.filter(
                          (i) => i.month === selectedMonth && Number(i.year) === Number(selectedYear)
                        );
                        generateCycleBatchPDF(
                          cycleInvoices.length > 0 ? cycleInvoices : invoices,
                          selectedMonth,
                          Number(selectedYear)
                        );
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Generated Cycle PDF Package
                    </button>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleGenerateInvoices}
                    disabled={generating}
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    Run Billing Generator
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PHONEPE UPI QR MODAL */}
      <InvoiceQrModal
        invoice={selectedQrInvoice}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onPaymentSuccess={fetchInvoices}
      />

      {/* PAYMENT & GATEWAY SETTINGS MODAL */}
      {isPaymentSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" /> Payment & Billing Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure PhonePe gateway integration, UPI merchant account, late fine rules, and payment options.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentSettingsModalOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSettingsSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paymentSettingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentSettings} className="space-y-5">
              {/* SECTION 1: MERCHANT & BANK ACCOUNT DETAILS */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> PhonePe & Bank Account Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Merchant / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentSettings.merchantName || ''}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, merchantName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Merchant VPA / UPI ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentSettings.merchantUpiVpa || ''}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, merchantUpiVpa: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.bankName || ''}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, bankName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.bankAccountNumber || ''}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.ifscCode || ''}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, ifscCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PAYMENT METHOD TOGGLES */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Enabled Payment Channels
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!paymentSettings.phonePeQrEnabled}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, phonePeQrEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">PhonePe QR</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!paymentSettings.upiCollectEnabled}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, upiCollectEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">UPI Collect</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!paymentSettings.cashPaymentEnabled}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, cashPaymentEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Offline Cash</span>
                  </label>
                </div>
              </div>

              {/* SECTION 3: RENT DUE DATE & LATE FEE POLICY */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Rent Schedule & Late Fee Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Rent Due Day
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={paymentSettings.rentDueDay ?? 10}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, rentDueDay: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Day of month (e.g. 10th)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={paymentSettings.gracePeriodDays ?? 3}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, gracePeriodDays: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Days before fine kicks in</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Daily Overdue Fine (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={paymentSettings.lateFeePerDay ?? 50}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, lateFeePerDay: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Fine charged per day late</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!paymentSettings.autoApplyLateFee}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, autoApplyLateFee: e.target.checked })
                    }
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Automatically apply late fees to overdue invoices after grace period
                  </span>
                </label>
              </div>

              {/* SECTION 4: AUTOMATED NOTIFICATIONS */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <h4 className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-2">
                  <BellRing className="w-4 h-4" /> Automated SMS Receipt Dispatch
                </h4>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!paymentSettings.autoSendPaymentReceiptSms}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, autoSendPaymentReceiptSms: e.target.checked })
                      }
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Send instant Twilio SMS receipt upon successful PhonePe payment
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!paymentSettings.includeQrInSmsReminder}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, includeQrInSmsReminder: e.target.checked })
                      }
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Embed PhonePe payment URL link inside automated SMS rent alerts
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentSettingsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Payment Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
