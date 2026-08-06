'use client';

import React, { useState, useEffect } from 'react';
import { hostelStore } from '@/lib/store';
import { exportToExcel, exportToCSV } from '@/lib/export-utils';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Calendar,
  Filter,
  CheckCircle2,
  Building2,
  Users,
  Wrench,
  IndianRupee,
} from 'lucide-react';

export default function ReportsView() {
  const [reportType, setReportType] = useState<'revenue' | 'occupancy' | 'residents' | 'maintenance'>('revenue');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Date filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rows) {
          setReportData(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setReportData(hostelStore.getReport(reportType, startDate, endDate));
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportExcel = () => {
    if (!reportData || !reportData.rows) return;
    exportToExcel(reportData.rows, `${reportType}_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows) return;
    exportToCSV(reportData.rows, `${reportType}_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Exportable Management Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate financial balance sheets, resident census, room occupancy, and maintenance SLA logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={!reportData || !reportData.rows}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!reportData || !reportData.rows}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setReportType('revenue')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            reportType === 'revenue'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500'
          }`}
        >
          <IndianRupee className="w-6 h-6 mb-2" />
          <div>
            <h4 className="font-bold text-sm">Revenue & Dues</h4>
            <p className="text-[10px] opacity-80">Collection & outstanding rent</p>
          </div>
        </button>

        <button
          onClick={() => setReportType('occupancy')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            reportType === 'occupancy'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500'
          }`}
        >
          <Building2 className="w-6 h-6 mb-2" />
          <div>
            <h4 className="font-bold text-sm">Room Occupancy</h4>
            <p className="text-[10px] opacity-80">Bed capacity & utilization</p>
          </div>
        </button>

        <button
          onClick={() => setReportType('residents')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            reportType === 'residents'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500'
          }`}
        >
          <Users className="w-6 h-6 mb-2" />
          <div>
            <h4 className="font-bold text-sm">Resident Census</h4>
            <p className="text-[10px] opacity-80">Directory & KYC verification</p>
          </div>
        </button>

        <button
          onClick={() => setReportType('maintenance')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            reportType === 'maintenance'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500'
          }`}
        >
          <Wrench className="w-6 h-6 mb-2" />
          <div>
            <h4 className="font-bold text-sm">Maintenance Log</h4>
            <p className="text-[10px] opacity-80">SLA & staff task completion</p>
          </div>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition"
        >
          Apply Filter
        </button>
      </div>

      {/* Report Summary Cards */}
      {reportData && reportData.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(reportData.summary).map(([key, val]: any) => (
            <div key={key} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {typeof val === 'number' && key.toLowerCase().includes('amount') ? `₹${val.toLocaleString('en-IN')}` : val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Table Preview */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : reportData && reportData.rows && reportData.rows.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  {Object.keys(reportData.rows[0]).map((col) => (
                    <th key={col} className="py-3.5 px-4">{col.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {Object.values(row).map((val: any, cIdx: number) => (
                      <td key={cIdx} className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {typeof val === 'number' && val > 1000 ? `₹${val.toLocaleString('en-IN')}` : String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No records match the requested report filter.
        </div>
      )}
    </div>
  );
}
