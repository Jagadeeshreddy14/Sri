'use client';

import React, { useState, useEffect } from 'react';
import { MaintenanceRequest, Staff } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import {
  Wrench,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
  Plus,
} from 'lucide-react';

export default function MaintenanceAdmin() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [newStatus, setNewStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('PENDING');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, staffRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/staff'),
      ]);

      let reqs = null;
      let staff = null;

      if (reqRes.ok) reqs = await reqRes.json();
      if (staffRes.ok) staff = await staffRes.json();

      setRequests(Array.isArray(reqs) ? reqs : hostelStore.getMaintenance());
      setStaffList(Array.isArray(staff) ? staff : hostelStore.getStaff());
    } catch (e) {
      console.error(e);
      setRequests(hostelStore.getMaintenance());
      setStaffList(hostelStore.getStaff());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (req: MaintenanceRequest) => {
    setSelectedReq(req);
    setAssignedStaffId(req.assignedStaffId || '');
    setNewStatus(req.status);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const staffObj = staffList.find((s) => s.id === assignedStaffId);

    try {
      const res = await fetch(`/api/maintenance/${selectedReq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedStaffId: assignedStaffId || null,
          assignedStaffName: staffObj ? staffObj.name : null,
        }),
      });

      if (res.ok) {
        setSelectedReq(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" /> Maintenance Tickets & Staff Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor reported resident issues, assign technicians, and track resolution SLA.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Filter Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="HIGH">HIGH Priority</option>
            <option value="MEDIUM">MEDIUM Priority</option>
            <option value="LOW">LOW Priority</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Tickets Found</h3>
          <p className="text-xs text-slate-500">All hostel maintenance requests have been resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : req.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" /> {req.priority} PRIORITY
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : req.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Category: {req.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    "{req.description}"
                  </p>
                </div>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Resident: {req.residentName}</span>
                    <span>Room {req.roomNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Assigned: {req.assignedStaffName || 'Unassigned'}</span>
                    <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenModal(req)}
                  className="w-full py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Update Ticket / Assign Staff
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE TICKET MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" /> Ticket Management
              </h3>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Staff Member</label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Update Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
