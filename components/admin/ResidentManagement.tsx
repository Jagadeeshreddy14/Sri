'use client';

import React, { useState, useEffect } from 'react';
import { Resident, Room } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Upload,
  User,
  Bed,
  CreditCard,
  Building2,
  Eye,
} from 'lucide-react';

export default function ResidentManagement() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [selectedDocResident, setSelectedDocResident] = useState<Resident | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedNumber, setBedNumber] = useState('A');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositAmount, setDepositAmount] = useState(8500);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Simulated Document uploads
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [docStatus, setDocStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('PENDING');

  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, roomRes] = await Promise.all([
        fetch('/api/residents'),
        fetch('/api/rooms'),
      ]);

      let resData = null;
      let roomData = null;

      if (resRes.ok) resData = await resRes.json();
      if (roomRes.ok) roomData = await roomRes.json();

      setResidents(Array.isArray(resData) ? resData : hostelStore.getResidents());
      setRooms(Array.isArray(roomData) ? roomData : hostelStore.getRooms());
    } catch (e) {
      console.error(e);
      setResidents(hostelStore.getResidents());
      setRooms(hostelStore.getRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingResident(null);
    setName('');
    setEmail('');
    setPhone('');
    setEmergencyContact('');
    setRoomId('');
    setBedNumber('A');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setDepositAmount(8500);
    setStatus('ACTIVE');
    setAadhaarUrl('');
    setPanUrl('');
    setDocStatus('PENDING');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: Resident) => {
    setEditingResident(r);
    setName(r.name);
    setEmail(r.email);
    setPhone(r.phone);
    setEmergencyContact(r.emergencyContact || '');
    setRoomId(r.roomId || '');
    setBedNumber(r.bedNumber || 'A');
    setJoinDate(r.joinDate ? r.joinDate.split('T')[0] : '');
    setDepositAmount(r.depositAmount || 0);
    setStatus(r.status);
    setAadhaarUrl(r.documents?.aadhaarUrl || '');
    setPanUrl(r.documents?.panUrl || '');
    setDocStatus(r.documents?.status || 'PENDING');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!/^\d{10}$/.test(phone)) {
      setError('Mobile phone number must be exactly 10 digits.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      emergencyContact,
      roomId: roomId || null,
      bedNumber,
      joinDate,
      depositAmount: Number(depositAmount),
      status,
      documents: {
        aadhaarUrl: aadhaarUrl || 'https://picsum.photos/seed/aadhaar/400/250',
        panUrl: panUrl || 'https://picsum.photos/seed/pan/400/250',
        status: docStatus,
      },
    };

    try {
      const url = editingResident ? `/api/residents/${editingResident.id}` : '/api/residents';
      const method = editingResident ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save resident');

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteResident = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resident? Room space will be vacated.')) return;
    try {
      const res = await fetch(`/api/residents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const digitsOnlyQuery = searchQuery.replace(/\D/g, '');

  const filteredResidents = residents.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    if (!matchesStatus) return false;

    if (!normalizedQuery) return true;

    // 1. Name match
    const nameMatch = (r.name || '').toLowerCase().includes(normalizedQuery);

    // 2. Email match
    const emailMatch = (r.email || '').toLowerCase().includes(normalizedQuery);

    // 3. Room match (e.g., '101', 'room 101')
    const roomStr = r.roomNumber ? String(r.roomNumber).toLowerCase() : '';
    const roomMatch =
      roomStr.includes(normalizedQuery) ||
      `room ${roomStr}`.includes(normalizedQuery) ||
      `room#${roomStr}`.includes(normalizedQuery);

    // 4. Phone number match (matches formatted string and extracted digits)
    const phoneStr = (r.phone || '').toLowerCase();
    const phoneDigits = phoneStr.replace(/\D/g, '');
    const phoneMatch =
      phoneStr.includes(normalizedQuery) ||
      (digitsOnlyQuery.length >= 2 && phoneDigits.includes(digitsOnlyQuery));

    return nameMatch || emailMatch || roomMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Resident Directory & Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register students, verify identity documents (Aadhaar/PAN), and allocate bed numbers.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Onboard Resident
        </button>
      </div>

      {/* Global Real-Time Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Resident Name, Room Number (e.g. 101), or Phone Number..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="All">All Residents</option>
              <option value="ACTIVE">Active Residents</option>
              <option value="INACTIVE">Vacated / Inactive</option>
            </select>
          </div>
        </div>

        {/* Live Search Metadata & Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {filteredResidents.length}
            </span>
            <span>resident(s) found</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                Matching: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400">Quick search:</span>
            {['Aarav', '101', '98765'].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg transition font-mono"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Residents Found</h3>
          <p className="text-xs text-slate-500">Add a new resident or adjust search parameters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-4">Room & Bed</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">KYC Documents</th>
                  <th className="py-3.5 px-4">Join Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.profileImage || 'https://picsum.photos/seed/user/200/200'}
                          alt={r.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                          <p className="text-[11px] text-slate-400">{r.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {r.roomNumber ? (
                        <div>
                          <span className="font-bold text-blue-600 dark:text-blue-400">Room {r.roomNumber}</span>
                          <span className="text-[10px] text-slate-400 ml-2">Bed #{r.bedNumber}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-semibold italic">Unallocated</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <div>+91 {r.phone}</div>
                      {r.emergencyContact && (
                        <div className="text-[10px] text-slate-400 font-sans">Emg: {r.emergencyContact}</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedDocResident(r)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                          r.documents?.status === 'VERIFIED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {r.documents?.status || 'PENDING'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {new Date(r.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {r.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResident(r.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> KYC Verification - {selectedDocResident.name}
              </h3>
              <button onClick={() => setSelectedDocResident(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Identification Card</p>
                <img
                  src={selectedDocResident.documents?.aadhaarUrl || 'https://picsum.photos/seed/aadhaar/400/250'}
                  alt="Aadhaar"
                  className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">PAN / Passport Document</p>
                <img
                  src={selectedDocResident.documents?.panUrl || 'https://picsum.photos/seed/pan/400/250'}
                  alt="PAN"
                  className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Status: Verified Official ID</span>
                <button
                  onClick={() => setSelectedDocResident(null)}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT RESIDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {editingResident ? 'Edit Resident Profile' : 'Onboard New Resident'}
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

            <form onSubmit={handleSaveResident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Aarav Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="aarav@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Parent Contact</label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9876500000"
                  />
                </div>
              </div>

              {/* Room Allocation Select */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allocate Room *</label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Select Available Room</option>
                    {rooms.map((room) => {
                      const isFull = room.occupancy >= room.capacity && room.id !== editingResident?.roomId;
                      return (
                        <option key={room.id} value={room.id} disabled={isFull}>
                          Room {room.roomNumber} ({room.category} - {room.occupancy}/{room.capacity} beds) {isFull ? '[FULL]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bed Tag/Letter</label>
                  <select
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="A">Bed A</option>
                    <option value="B">Bed B</option>
                    <option value="C">Bed C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-In / Join Date</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Deposit Paid (₹)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* KYC Document uploads simulation */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Identity Documents (KYC)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-1">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Aadhaar Front/Back</p>
                    <p className="text-[9px] text-slate-400">Simulated Upload Verified</p>
                  </div>
                  <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-1">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">PAN / College ID</p>
                    <p className="text-[9px] text-slate-400">Simulated Upload Verified</p>
                  </div>
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
                  Save Resident Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
