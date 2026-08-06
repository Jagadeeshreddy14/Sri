'use client';

import React, { useState, useEffect } from 'react';
import { Staff } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  X,
  Shield,
  Clock,
  IndianRupee,
} from 'lucide-react';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Warden' | 'Cleaner' | 'Security' | 'Chef' | 'Electrician' | 'Maintenance'>('Cleaner');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night' | 'Full Time'>('Full Time');
  const [salary, setSalary] = useState(18000);
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStaffList(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setStaffList(hostelStore.getStaff());
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Cleaner');
    setShift('Full Time');
    setSalary(18000);
    setJoinDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone);
    setRole(s.role as any);
    setShift(s.shift || 'Full Time');
    setSalary(s.salary || 18000);
    setJoinDate(s.joinDate ? s.joinDate.split('T')[0] : '');
    setStatus(s.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      email,
      phone,
      role,
      shift,
      salary: Number(salary),
      joinDate,
      status,
    };

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save staff member');

      setIsModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchStaff();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesQuery =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery);

    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" /> Staff & Duty Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage hostel wardens, security guards, maintenance technicians, and mess chefs.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
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
            placeholder="Search staff name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Warden">Warden</option>
            <option value="Cleaner">Housekeeping</option>
            <option value="Security">Security Guard</option>
            <option value="Chef">Mess Chef</option>
            <option value="Electrician">Electrician</option>
            <option value="Maintenance">Maintenance Tech</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Staff Members Found</h3>
          <p className="text-xs text-slate-500">Add a staff member or change role filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
                    {s.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                    {(s.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile</span>
                    <span className="font-mono text-slate-900 dark:text-white">+91 {s.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Shift</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{s.shift}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Monthly Salary</span>
                    <span className="font-bold text-emerald-600">₹{(s.salary || 18000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenEditModal(s)}
                  className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(s.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                {editingStaff ? 'Edit Staff Profile' : 'Add Staff Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                    placeholder="Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                    placeholder="ramesh@grandhorizon.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Role *</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Warden">Assistant Warden</option>
                    <option value="Cleaner">Housekeeping Staff</option>
                    <option value="Security">Security Guard</option>
                    <option value="Chef">Mess Chef</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Maintenance">Maintenance Tech</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duty Shift *</label>
                  <select
                    value={shift}
                    onChange={(e: any) => setShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Morning">Morning (6 AM - 2 PM)</option>
                    <option value="Evening">Evening (2 PM - 10 PM)</option>
                    <option value="Night">Night (10 PM - 6 AM)</option>
                    <option value="Full Time">Full Day (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Save Staff Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
