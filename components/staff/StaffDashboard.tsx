'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MaintenanceRequest, Room, Notification } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Building2,
  Bell,
  Check,
  UserCheck,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [assignedTickets, setAssignedTickets] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [mRes, rRes, nRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/rooms'),
        fetch('/api/notifications'),
      ]);

      let m: MaintenanceRequest[] | null = null;
      let r: Room[] | null = null;
      let n: Notification[] | null = null;

      if (mRes.ok) m = await mRes.json();
      if (rRes.ok) r = await rRes.json();
      if (nRes.ok) n = await nRes.json();

      setAssignedTickets(Array.isArray(m) ? m : hostelStore.getMaintenance());
      setRooms(Array.isArray(r) ? r : hostelStore.getRooms());
      setNotifications(Array.isArray(n) ? n : hostelStore.getNotifications());
    } catch (e) {
      console.error(e);
      setAssignedTickets(hostelStore.getMaintenance());
      setRooms(hostelStore.getRooms());
      setNotifications(hostelStore.getNotifications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [user]);

  const handleUpdateStatus = async (ticketId: string, status: 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      const res = await fetch(`/api/maintenance/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedStaffId: user?.id,
          assignedStaffName: user?.name,
        }),
      });

      if (res.ok) {
        fetchStaffData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-xl font-bold text-emerald-300">
            🛠️
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Staff Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">Hello, {user?.name}</h1>
            <p className="text-xs text-slate-300">Hostel Maintenance & Security Duty Desk</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Assigned Maintenance Tasks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" /> Active Maintenance Tasks
            </h3>

            <div className="space-y-4">
              {assignedTickets.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No maintenance tasks currently pending.</p>
              ) : (
                assignedTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase">
                        {t.category} • Room {t.roomNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">"{t.description}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Reported by: <strong>{t.residentName}</strong></span>

                      <div className="flex items-center gap-2">
                        {t.status !== 'IN_PROGRESS' && t.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
                          >
                            Start Work
                          </button>
                        )}
                        {t.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                            className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Room Roster Quick View */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" /> Room Occupancy Status
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Room {r.roomNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{r.category}</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {r.occupancy}/{r.capacity} Beds
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" /> Duty Announcements
            </h3>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs space-y-0.5">
                  <span className="font-bold text-purple-900 dark:text-purple-300 block">{n.title}</span>
                  <p className="text-purple-800 dark:text-purple-300 text-[11px]">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
