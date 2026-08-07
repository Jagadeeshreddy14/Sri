'use client';

import React, { useState, useEffect } from 'react';
import { Room, FloorWifi } from '@/lib/types';
import { hostelStore } from '@/lib/store';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  IndianRupee,
  Bed,
  Check,
  Wifi,
  Copy,
  Radio,
  Eye,
  EyeOff,
  QrCode,
  Sparkles,
  ShieldCheck,
  Settings2,
} from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'wifi'>('rooms');
  const [floorWifis, setFloorWifis] = useState<FloorWifi[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showWifiPassMap, setShowWifiPassMap] = useState<{ [floor: number]: boolean }>({});

  // Floor Wifi Modal State
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [wifiFloor, setWifiFloor] = useState<number>(1);
  const [wifiSsid, setWifiSsid] = useState('GrandHorizon_Resident');
  const [wifiPassword, setWifiPassword] = useState('Fiber1Gbps#2026');
  const [wifiSpeed, setWifiSpeed] = useState('1 Gbps Fiber');
  const [wifiFrequency, setWifiFrequency] = useState('5 GHz Dual-Band');
  const [wifiNotes, setWifiNotes] = useState('Ground & 1st Floor High-Speed Mesh Access Point');
  const [wifiSuccessMsg, setWifiSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoomHistory, setSelectedRoomHistory] = useState<Room | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState<number>(1);
  const [category, setCategory] = useState<'Single' | 'Double' | 'Triple' | 'Deluxe'>('Double');
  const [capacity, setCapacity] = useState<number>(2);
  const [monthlyRent, setMonthlyRent] = useState<number>(8500);
  const [status, setStatus] = useState<'Available' | 'Fully Occupied' | 'Under Maintenance'>('Available');
  const [amenitiesInput, setAmenitiesInput] = useState('Wi-Fi, AC, Attached Bath, Study Desk');
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setRooms(hostelStore.getRooms());
    setLoading(false);
  };

  const fetchFloorWifis = async () => {
    try {
      const res = await fetch('/api/wifi/floors');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFloorWifis(data);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setFloorWifis(hostelStore.getFloorWifis());
  };

  useEffect(() => {
    fetchRooms();
    fetchFloorWifis();
  }, []);

  const getWifiForFloor = (fl: number): FloorWifi => {
    const found = floorWifis.find((w) => Number(w.floor) === Number(fl));
    if (found) return found;
    return {
      floor: fl,
      ssid: fl === 1 ? 'GrandHorizon_Resident' : `GrandHorizon_Fl${fl}_5G`,
      password: 'Fiber1Gbps#2026',
      speed: '1 Gbps Fiber',
      frequency: '5 GHz Dual-Band',
      notes: `Floor ${fl} High-Speed Mesh Access Point`,
    };
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleOpenEditWifiModal = (fw?: FloorWifi, defaultFloor: number = 1) => {
    if (fw) {
      setWifiFloor(fw.floor);
      setWifiSsid(fw.ssid);
      setWifiPassword(fw.password);
      setWifiSpeed(fw.speed || '1 Gbps Fiber');
      setWifiFrequency(fw.frequency || '5 GHz Dual-Band');
      setWifiNotes(fw.notes || '');
    } else {
      setWifiFloor(defaultFloor);
      setWifiSsid(defaultFloor === 1 ? 'GrandHorizon_Resident' : `GrandHorizon_Fl${defaultFloor}_5G`);
      setWifiPassword('Fiber1Gbps#2026');
      setWifiSpeed('1 Gbps Fiber');
      setWifiFrequency('5 GHz Dual-Band');
      setWifiNotes(`Floor ${defaultFloor} Mesh Access Point`);
    }
    setIsWifiModalOpen(true);
  };

  const handleSaveFloorWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: FloorWifi = {
      floor: Number(wifiFloor),
      ssid: wifiSsid,
      password: wifiPassword,
      speed: wifiSpeed,
      frequency: wifiFrequency,
      notes: wifiNotes,
    };

    try {
      const res = await fetch('/api/wifi/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save Floor Wi-Fi configuration');
      setIsWifiModalOpen(false);
      setWifiSuccessMsg(`Wi-Fi credentials for Floor ${wifiFloor} saved successfully!`);
      setTimeout(() => setWifiSuccessMsg(null), 3500);
      fetchFloorWifis();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(1);
    setCategory('Double');
    setCapacity(2);
    setMonthlyRent(8500);
    setStatus('Available');
    setAmenitiesInput('Wi-Fi, AC, Attached Bath, Study Desk');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor);
    setCategory(room.category);
    setCapacity(room.capacity);
    setMonthlyRent(room.monthlyRent);
    setStatus(room.status);
    setAmenitiesInput(room.amenities.join(', '));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amenities = amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      roomNumber,
      floor: Number(floor),
      category,
      capacity: Number(capacity),
      monthlyRent: Number(monthlyRent),
      status,
      amenities,
    };

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save room');

      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room? This will unassign any active residents!')) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Category selection handler to auto update capacity/rent defaults
  const handleCategoryChange = (cat: 'Single' | 'Double' | 'Triple' | 'Deluxe') => {
    setCategory(cat);
    if (cat === 'Single') { setCapacity(1); setMonthlyRent(12000); }
    else if (cat === 'Double') { setCapacity(2); setMonthlyRent(8500); }
    else if (cat === 'Triple') { setCapacity(3); setMonthlyRent(6500); }
    else if (cat === 'Deluxe') { setCapacity(1); setMonthlyRent(16000); }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch = (r.roomNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Room Allocation & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage room capacities, rental tariffs, floor-wise Wi-Fi networks, and resident assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditWifiModal(undefined, 1)}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 border border-indigo-500"
            title="Configure Floor Wi-Fi Networks & Passwords"
          >
            <Wifi className="w-4 h-4" /> Config Floor Wi-Fi
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'rooms'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Room Allocation ({rooms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('wifi')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'wifi'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Wifi className="w-4 h-4 text-indigo-300" /> Floor Wi-Fi Networks ({floorWifis.length || 4})
        </button>
      </div>

      {wifiSuccessMsg && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{wifiSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: ROOMS GRID */}
      {activeSubTab === 'rooms' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room number..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" /> Filter Category:
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Deluxe">Deluxe</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Fully Occupied">Fully Occupied</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Rooms Found</h3>
              <p className="text-xs text-slate-500">Try relaxing your search query or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const isFull = room.occupancy >= room.capacity;
                const isMaintenance = room.status === 'Under Maintenance';
                const fw = getWifiForFloor(room.floor);

                return (
                  <div
                    key={room.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Floor {room.floor}</span>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Room {room.roomNumber}</h3>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            isMaintenance
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : isFull
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isMaintenance ? <Wrench className="w-3.5 h-3.5" /> : isFull ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {room.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Category</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{room.category} Sharing</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Rent Tariff</p>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">₹{(room.monthlyRent || 0).toLocaleString('en-IN')}/mo</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Beds Occupied</p>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {room.occupancy} / {room.capacity}
                          </p>
                        </div>
                      </div>

                      {/* Floor Wi-Fi Badge */}
                      <div className="mt-3 p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Wifi className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-[11px] font-extrabold text-indigo-950 dark:text-indigo-200 truncate">
                              {fw.ssid}
                            </p>
                            <p className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                              Pass: {fw.password}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyText(`SSID: ${fw.ssid}\nPass: ${fw.password}`, `room-${room.id}`)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-800 shrink-0 hover:bg-indigo-100 transition"
                          title="Copy Floor Wi-Fi details"
                        >
                          {copiedText === `room-${room.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Amenities tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {room.amenities.map((a) => (
                          <span key={a} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-lg">
                            {a}
                          </span>
                        ))}
                      </div>

                      {/* Residents assigned list preview */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Assigned Residents:
                        </p>
                        {room.residents && room.residents.length > 0 ? (
                          <div className="space-y-1">
                            {room.residents.map((r) => (
                              <div key={r.id} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                <span>• {r.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Bed #{r.bedNumber || 'A'}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400">No residents allocated currently.</p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <button
                        onClick={() => handleOpenEditModal(room)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                        title="Edit Room Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: DEDICATED FLOOR WI-FI NETWORKS VIEW */}
      {activeSubTab === 'wifi' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 p-6 rounded-3xl text-white shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-800/50 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  Floor-Wise Network Access Points
                </span>
                <h2 className="text-2xl font-black mt-1.5 flex items-center gap-2">
                  <Wifi className="w-6 h-6 text-indigo-400" /> Floor Wi-Fi SSID & Password Credentials
                </h2>
                <p className="text-xs text-indigo-200 max-w-xl">
                  Configure separate high-speed Wi-Fi access point SSIDs and passwords per floor. Residents will see their specific floor's credentials directly in their portal.
                </p>
              </div>

              <button
                onClick={() => handleOpenEditWifiModal(undefined, (floorWifis.length || 0) + 1)}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Floor Network
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((floorNum) => {
              const fw = getWifiForFloor(floorNum);
              const floorRooms = rooms.filter((r) => Number(r.floor) === floorNum);
              const isPassVisible = !!showWifiPassMap[floorNum];

              return (
                <div
                  key={floorNum}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
                        F{floorNum}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Floor {floorNum} Wi-Fi
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {floorRooms.length} Rooms Allocated on this Floor
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Active 5GHz
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Network Name (SSID)
                      </span>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {fw.ssid}
                        </span>
                        <button
                          onClick={() => handleCopyText(fw.ssid, `ssid-${floorNum}`)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedText === `ssid-${floorNum}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Wi-Fi Password
                      </span>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {isPassVisible ? fw.password : '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setShowWifiPassMap({
                                ...showWifiPassMap,
                                [floorNum]: !isPassVisible,
                              })
                            }
                            className="text-slate-400 hover:text-slate-600"
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyText(fw.password, `pass-${floorNum}`)}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedText === `pass-${floorNum}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Speed</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{fw.speed || '1 Gbps Fiber'}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Frequency</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{fw.frequency || '5 GHz Dual-Band'}</span>
                      </div>
                    </div>

                    {fw.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1">
                        Note: {fw.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleCopyText(`Wi-Fi SSID: ${fw.ssid}\nPassword: ${fw.password}`, `all-${floorNum}`)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      {copiedText === `all-${floorNum}` ? 'Copied Full Details!' : 'Copy Full Details'}
                    </button>

                    <button
                      onClick={() => handleOpenEditWifiModal(fw, floorNum)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Floor Wi-Fi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD/EDIT ROOM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                {editingRoom ? 'Edit Room Configuration' : 'Add New Room'}
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

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 101"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Floor Level *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e: any) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Single">Single Private</option>
                    <option value="Double">Twin Sharing</option>
                    <option value="Triple">Triple Sharing</option>
                    <option value="Deluxe">Executive Deluxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bed Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Rent Tariff (₹) *</label>
                  <input
                    type="number"
                    required
                    step={500}
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Status *</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Fully Occupied">Fully Occupied</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wi-Fi, AC, Attached Bath, Balcony"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FLOOR WI-FI MODAL */}
      {isWifiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-600" />
                Floor {wifiFloor} Wi-Fi Configuration
              </h3>
              <button onClick={() => setIsWifiModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFloorWifi} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Number *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={wifiFloor}
                    onChange={(e) => setWifiFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency / Band
                  </label>
                  <input
                    type="text"
                    value={wifiFrequency}
                    onChange={(e) => setWifiFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 5 GHz Dual-Band"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Network SSID (Wi-Fi Name) *
                </label>
                <input
                  type="text"
                  required
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. GrandHorizon_Resident or GrandHorizon_Fl1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Wi-Fi Password / Security Key *
                </label>
                <input
                  type="text"
                  required
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Fiber1Gbps#2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Speed Rating
                </label>
                <input
                  type="text"
                  value={wifiSpeed}
                  onChange={(e) => setWifiSpeed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 1 Gbps Fiber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Access Point Location
                </label>
                <textarea
                  rows={2}
                  value={wifiNotes}
                  onChange={(e) => setWifiNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Corridor Access Point, High-Density Wi-Fi 6"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWifiModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Save Wi-Fi Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
