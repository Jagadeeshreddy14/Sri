'use client';

import React, { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import { generateInvoicePDF } from '@/lib/pdf-generator';
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
} from 'lucide-react';

export default function SmartBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Generate Invoice Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  useEffect(() => {
    fetchInvoices();
  }, []);

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

  const handleDownloadPDF = (inv: Invoice) => {
    generateInvoicePDF(inv);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesQuery =
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.residentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.roomNumber && inv.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" /> Smart Billing & Automated Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate monthly rent bills with fine rules, track PhonePe payments, and export PDF receipts.
          </p>
        </div>
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
          <span className="text-xs text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="All">All Invoices</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Invoices Found</h3>
          <p className="text-xs text-slate-500">Click batch generate to create monthly invoices for active residents.</p>
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
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">PDF Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
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
                        <span className="block text-[9px] text-rose-500 font-normal">
                          Includes ₹{inv.fine} late fee
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {inv.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center justify-end gap-1 ml-auto font-bold text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
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
              <button onClick={() => setIsGenerateModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This process scans all active residents with allocated rooms and generates monthly invoices. Duplicate invoices for the same month/year are automatically prevented.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Year</label>
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
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs rounded-xl font-medium">
                {generateResult}
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
                {generating ? 'Processing...' : 'Run Billing Generator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
