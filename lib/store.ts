import { Room, Resident, Staff, Invoice, MaintenanceRequest, Notification, SmsLog, SmsSettings, RecurringBillingSettings, SmsTemplate, PaymentSettings, FloorWifi } from './types';
import {
  sendSmsNotification,
  buildPaymentDueSmsText,
  buildMaintenanceUpdateSmsText,
  buildEmergencyBroadcastSmsText,
  checkTwilioConfiguration,
} from './sms-service';

const STORAGE_KEY = 'gh_hostel_store_v1';

// Initial Mock Seed Data
const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    floor: 1,
    category: 'Double',
    capacity: 2,
    occupancy: 2,
    monthlyRent: 8500,
    status: 'Fully Occupied',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Study Desk', 'Balcony'],
    residents: [
      { id: 'res-101', name: 'Aarav Sharma', bedNumber: 'A' },
      { id: 'res-102', name: 'Rohan Mehta', bedNumber: 'B' },
    ],
  },
  {
    id: 'room-102',
    roomNumber: '102',
    floor: 1,
    category: 'Single',
    capacity: 1,
    occupancy: 1,
    monthlyRent: 12000,
    status: 'Fully Occupied',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Study Desk', 'Mini Fridge'],
    residents: [{ id: 'res-103', name: 'Vikramaditya Singh', bedNumber: 'A' }],
  },
  {
    id: 'room-103',
    roomNumber: '103',
    floor: 1,
    category: 'Double',
    capacity: 2,
    occupancy: 1,
    monthlyRent: 8500,
    status: 'Available',
    amenities: ['Wi-Fi', 'Attached Bath', 'Study Desk'],
    residents: [{ id: 'res-104', name: 'Devansh Verma', bedNumber: 'A' }],
  },
  {
    id: 'room-104',
    roomNumber: '104',
    floor: 1,
    category: 'Triple',
    capacity: 3,
    occupancy: 3,
    monthlyRent: 6500,
    status: 'Fully Occupied',
    amenities: ['Wi-Fi', 'Study Desk', 'Shared Bath'],
    residents: [
      { id: 'res-105', name: 'Kabir Das', bedNumber: 'A' },
      { id: 'res-106', name: 'Siddharth Roy', bedNumber: 'B' },
      { id: 'res-107', name: 'Arjun Gupta', bedNumber: 'C' },
    ],
  },
  {
    id: 'room-201',
    roomNumber: '201',
    floor: 2,
    category: 'Deluxe',
    capacity: 1,
    occupancy: 0,
    monthlyRent: 16000,
    status: 'Available',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Balcony', 'TV', 'Sofa'],
    residents: [],
  },
  {
    id: 'room-202',
    roomNumber: '202',
    floor: 2,
    category: 'Double',
    capacity: 2,
    occupancy: 0,
    monthlyRent: 8500,
    status: 'Under Maintenance',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath'],
    residents: [],
  },
];

const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-101',
    name: 'Aarav Sharma',
    email: 'resident@grandhorizon.com',
    phone: '9876512345',
    emergencyContact: '9876500001',
    roomId: 'room-101',
    roomNumber: '101',
    bedNumber: 'A',
    joinDate: '2026-01-10',
    depositAmount: 8500,
    status: 'ACTIVE',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    documents: {
      aadhaarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      panUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'VERIFIED',
    },
  },
  {
    id: 'res-102',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '9876523456',
    emergencyContact: '9876500002',
    roomId: 'room-101',
    roomNumber: '101',
    bedNumber: 'B',
    joinDate: '2026-01-15',
    depositAmount: 8500,
    status: 'ACTIVE',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    documents: {
      aadhaarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      panUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'VERIFIED',
    },
  },
  {
    id: 'res-103',
    name: 'Vikramaditya Singh',
    email: 'vikram@example.com',
    phone: '9876534567',
    emergencyContact: '9876500003',
    roomId: 'room-102',
    roomNumber: '102',
    bedNumber: 'A',
    joinDate: '2026-02-01',
    depositAmount: 12000,
    status: 'ACTIVE',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    documents: {
      aadhaarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      panUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'VERIFIED',
    },
  },
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Suresh Kumar',
    email: 'staff@grandhorizon.com',
    phone: '9876588888',
    role: 'Warden',
    shift: 'Full Time',
    salary: 28000,
    joinDate: '2025-06-01',
    status: 'ACTIVE',
  },
  {
    id: 'staff-2',
    name: 'Ramesh Chand',
    email: 'ramesh.cleaner@grandhorizon.com',
    phone: '9876577777',
    role: 'Cleaner',
    shift: 'Morning',
    salary: 16000,
    joinDate: '2025-08-10',
    status: 'ACTIVE',
  },
  {
    id: 'staff-3',
    name: 'Mahesh Sharma',
    email: 'mahesh.guard@grandhorizon.com',
    phone: '9876566666',
    role: 'Security',
    shift: 'Night',
    salary: 19000,
    joinDate: '2025-09-15',
    status: 'ACTIVE',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-801',
    invoiceNumber: 'INV-2026-0801',
    residentId: 'res-101',
    residentName: 'Aarav Sharma',
    roomNumber: '101',
    month: 'August',
    year: 2026,
    rentAmount: 8500,
    electricityUnits: 45,
    electricityCharges: 450,
    waterCharges: 200,
    fine: 0,
    totalAmount: 9150,
    dueDate: '2026-08-10',
    status: 'PENDING',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'inv-802',
    invoiceNumber: 'INV-2026-0802',
    residentId: 'res-102',
    residentName: 'Rohan Mehta',
    roomNumber: '101',
    month: 'August',
    year: 2026,
    rentAmount: 8500,
    electricityUnits: 30,
    electricityCharges: 300,
    waterCharges: 200,
    fine: 0,
    totalAmount: 9000,
    dueDate: '2026-08-10',
    status: 'PAID',
    paymentDate: '2026-08-03T14:20:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'inv-701',
    invoiceNumber: 'INV-2026-0701',
    residentId: 'res-101',
    residentName: 'Aarav Sharma',
    roomNumber: '101',
    month: 'July',
    year: 2026,
    rentAmount: 8500,
    electricityUnits: 50,
    electricityCharges: 500,
    waterCharges: 200,
    fine: 0,
    totalAmount: 9200,
    dueDate: '2026-07-10',
    status: 'PAID',
    paymentDate: '2026-07-05T10:15:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'inv-702',
    invoiceNumber: 'INV-2026-0702',
    residentId: 'res-103',
    residentName: 'Priya Verma',
    roomNumber: '102',
    month: 'July',
    year: 2026,
    rentAmount: 9500,
    electricityUnits: 65,
    electricityCharges: 650,
    waterCharges: 200,
    fine: 500,
    totalAmount: 10850,
    dueDate: '2026-07-10',
    status: 'OVERDUE',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
];

const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'm-1',
    residentId: 'res-101',
    residentName: 'Aarav Sharma',
    roomId: 'room-101',
    roomNumber: '101',
    title: 'Tap leaking in attached bathroom',
    category: 'Plumbing',
    description: 'The bathroom basin tap drips water continuously causing noise at night.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedStaffId: 'staff-2',
    assignedStaffName: 'Ramesh Chand',
    createdAt: '2026-08-04T09:30:00.000Z',
  },
  {
    id: 'm-2',
    residentId: 'res-103',
    residentName: 'Vikramaditya Singh',
    roomId: 'room-102',
    roomNumber: '102',
    title: 'Wi-Fi signal fluctuating',
    category: 'Wi-Fi',
    description: 'Router signal strength drops in evening hours during online study.',
    priority: 'MEDIUM',
    status: 'PENDING',
    createdAt: '2026-08-05T11:00:00.000Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Monthly Rent Reminder',
    message: 'August 2026 rent invoices have been generated. Please clear dues by 10th August via PhonePe UPI.',
    createdAt: '2026-08-01T08:00:00.000Z',
    target: 'ALL',
  },
  {
    id: 'notif-2',
    title: 'Water Tank Sanitization Notice',
    message: 'Water tank cleaning is scheduled for Sunday 9:00 AM to 12:00 PM. Please store water in advance.',
    createdAt: '2026-08-03T16:00:00.000Z',
    target: 'ALL',
  },
];

const INITIAL_SMS_LOGS: SmsLog[] = [
  {
    id: 'sms-1',
    recipientName: 'Aarav Sharma',
    phone: '+919876512345',
    type: 'PAYMENT_DUE',
    message: 'Grand Horizon Hostel: Dear Aarav Sharma, your rent invoice of ₹9,150 (Room 101) is due on 2026-08-10. Please pay via PhonePe on your resident portal.',
    status: 'DELIVERED',
    sentAt: '2026-08-01T09:15:00.000Z',
    sid: 'SM90812345',
    triggeredBy: 'Auto Billing System',
  },
  {
    id: 'sms-2',
    recipientName: 'Rohan Mehta',
    phone: '+919876523456',
    type: 'MAINTENANCE_UPDATE',
    message: 'Grand Horizon Hostel Alert: Dear Rohan Mehta, your maintenance request "Tap leaking in attached bathroom" for Room 101 is now marked as "IN_PROGRESS".',
    status: 'DELIVERED',
    sentAt: '2026-08-04T09:31:00.000Z',
    sid: 'SM90812346',
    triggeredBy: 'Staff Action (Ramesh Chand)',
  },
  {
    id: 'sms-3',
    recipientName: 'All Active Residents (18)',
    phone: 'BROADCAST_GROUP',
    type: 'EMERGENCY_BROADCAST',
    message: '🚨 EMERGENCY HOSTEL BROADCAST [Grand Horizon]: WATER TANK CLEANING - Supply paused 9 AM to 12 PM Sunday. Contact Warden for urgent support.',
    status: 'DELIVERED',
    sentAt: '2026-08-03T16:01:00.000Z',
    sid: 'SM90812347',
    triggeredBy: 'Admin Warden',
  },
];

const INITIAL_SMS_SETTINGS: SmsSettings = {
  enabled: true,
  notifyOnInvoiceCreated: true,
  notifyOnPaymentOverdue: true,
  notifyOnMaintenanceUpdate: true,
  notifyOnPaymentReceived: true,
  emergencyBroadcastsEnabled: true,
  twilioConfigured: false,
};

const INITIAL_RECURRING_BILLING_SETTINGS: RecurringBillingSettings = {
  enabled: true,
  scheduleDay: 1, // 1st of every month
  autoSendSms: true,
  lastRunDate: '2026-08-01',
  nextRunDate: '2026-09-01',
};

const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Water Supply Maintenance Alert',
    category: 'BROADCAST',
    headline: 'WATER SUPPLY PAUSED',
    body: 'Water supply will be temporarily paused from 9 AM to 12 PM this Sunday for tank cleaning & sanitization. Please store water in advance.',
    isSystem: true,
  },
  {
    id: 'tmpl-2',
    title: 'Monthly Rent Invoice Notification',
    category: 'PAYMENT_DUE',
    headline: 'RENT INVOICE GENERATED',
    body: 'Dear {ResidentName}, your rent invoice for Room {RoomNo} of ₹{Amount} is generated. Please clear dues by 10th of this month via PhonePe on your portal.',
    isSystem: true,
  },
  {
    id: 'tmpl-3',
    title: 'Urgent Payment Overdue Alert',
    category: 'OVERDUE',
    headline: 'URGENT RENT OVERDUE',
    body: 'Dear {ResidentName}, your rent payment for Room {RoomNo} is OVERDUE. Please log in to your portal and complete payment immediately to avoid late fee charges.',
    isSystem: true,
  },
  {
    id: 'tmpl-4',
    title: 'Fire & Safety Inspection Drill',
    category: 'BROADCAST',
    headline: 'FIRE SAFETY DRILL',
    body: 'Attention Residents: A mandatory fire safety and alarm system check is scheduled today at 4:00 PM. No evacuation required.',
    isSystem: true,
  },
  {
    id: 'tmpl-5',
    title: 'Night Gate Lock Timings',
    category: 'GENERAL',
    headline: 'HOSTEL GATE TIMINGS',
    body: 'Hostel main entry gates close strictly at 10:30 PM. Late entry requires prior warden approval via the resident portal.',
    isSystem: true,
  },
  {
    id: 'tmpl-6',
    title: 'Maintenance Ticket Update',
    category: 'MAINTENANCE',
    headline: 'MAINTENANCE RESOLVED',
    body: 'Dear {ResidentName}, your room maintenance request for Room {RoomNo} has been completed and marked RESOLVED by staff.',
    isSystem: true,
  },
];

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  merchantName: 'Grand Horizon Hostel & Residences',
  merchantUpiVpa: 'grandhorizon@ybl',
  bankAccountName: 'Grand Horizon Management Pvt Ltd',
  bankName: 'HDFC Bank - MG Road Branch',
  bankAccountNumber: '50200084920192',
  ifscCode: 'HDFC0001234',
  phonePeQrEnabled: true,
  upiCollectEnabled: true,
  cashPaymentEnabled: true,
  rentDueDay: 10,
  gracePeriodDays: 3,
  lateFeePerDay: 50,
  autoApplyLateFee: true,
  autoSendPaymentReceiptSms: true,
  includeQrInSmsReminder: true,
};

const INITIAL_FLOOR_WIFI: FloorWifi[] = [
  {
    floor: 1,
    ssid: 'GrandHorizon_Resident',
    password: 'Fiber1Gbps#2026',
    speed: '1 Gbps Fiber',
    frequency: '5 GHz Dual-Band',
    notes: 'Ground & 1st Floor High-Speed Mesh Access Point',
  },
  {
    floor: 2,
    ssid: 'GrandHorizon_Fl2_5G',
    password: 'Fiber1Gbps#2026',
    speed: '1 Gbps Fiber',
    frequency: '5 GHz Dual-Band',
    notes: '2nd Floor High-Speed Mesh Access Point',
  },
  {
    floor: 3,
    ssid: 'GrandHorizon_Fl3_5G',
    password: 'Fiber1Gbps#2026',
    speed: '1 Gbps Fiber',
    frequency: '5 GHz Dual-Band',
    notes: '3rd Floor High-Speed Mesh Access Point',
  },
  {
    floor: 4,
    ssid: 'GrandHorizon_Fl4_5G',
    password: 'Fiber1Gbps#2026',
    speed: '1 Gbps Fiber',
    frequency: '5 GHz Dual-Band',
    notes: '4th Floor High-Speed Mesh Access Point',
  },
];

class HostelStore {
  private rooms: Room[] = [];
  private residents: Resident[] = [];
  private staff: Staff[] = [];
  private invoices: Invoice[] = [];
  private maintenance: MaintenanceRequest[] = [];
  private notifications: Notification[] = [];
  private smsLogs: SmsLog[] = [];
  private smsSettings: SmsSettings = INITIAL_SMS_SETTINGS;
  private recurringBillingSettings: RecurringBillingSettings = INITIAL_RECURRING_BILLING_SETTINGS;
  private smsTemplates: SmsTemplate[] = INITIAL_SMS_TEMPLATES;
  private paymentSettings: PaymentSettings = INITIAL_PAYMENT_SETTINGS;
  private floorWifis: FloorWifi[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        this.rooms = parsed.rooms || INITIAL_ROOMS;
        this.residents = parsed.residents || INITIAL_RESIDENTS;
        this.staff = parsed.staff || INITIAL_STAFF;
        this.invoices = parsed.invoices || INITIAL_INVOICES;
        this.maintenance = parsed.maintenance || INITIAL_MAINTENANCE;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.smsLogs = parsed.smsLogs || INITIAL_SMS_LOGS;
        this.smsSettings = parsed.smsSettings || INITIAL_SMS_SETTINGS;
        this.recurringBillingSettings = parsed.recurringBillingSettings || INITIAL_RECURRING_BILLING_SETTINGS;
        this.smsTemplates = parsed.smsTemplates || INITIAL_SMS_TEMPLATES;
        this.paymentSettings = parsed.paymentSettings || INITIAL_PAYMENT_SETTINGS;
        this.floorWifis = parsed.floorWifis || INITIAL_FLOOR_WIFI;
        return;
      }
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
    }

    this.rooms = [...INITIAL_ROOMS];
    this.residents = [...INITIAL_RESIDENTS];
    this.staff = [...INITIAL_STAFF];
    this.invoices = [...INITIAL_INVOICES];
    this.maintenance = [...INITIAL_MAINTENANCE];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.smsLogs = [...INITIAL_SMS_LOGS];
    this.smsSettings = { ...INITIAL_SMS_SETTINGS };
    this.recurringBillingSettings = { ...INITIAL_RECURRING_BILLING_SETTINGS };
    this.smsTemplates = [...INITIAL_SMS_TEMPLATES];
    this.paymentSettings = { ...INITIAL_PAYMENT_SETTINGS };
    this.floorWifis = [...INITIAL_FLOOR_WIFI];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          rooms: this.rooms,
          residents: this.residents,
          staff: this.staff,
          invoices: this.invoices,
          maintenance: this.maintenance,
          notifications: this.notifications,
          smsLogs: this.smsLogs,
          smsSettings: this.smsSettings,
          recurringBillingSettings: this.recurringBillingSettings,
          smsTemplates: this.smsTemplates,
          paymentSettings: this.paymentSettings,
          floorWifis: this.floorWifis,
        })
      );
    } catch (e) {
      console.error('Failed to save store to localStorage', e);
    }
  }


  // DASHBOARD METRICS
  public getDashboardStats() {
    const totalRooms = this.rooms.length;
    let totalBeds = 0;
    let occupiedBeds = 0;

    this.rooms.forEach((r) => {
      totalBeds += r.capacity;
      occupiedBeds += r.occupancy;
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const totalResidents = this.residents.filter((r) => r.status === 'ACTIVE').length;
    const pendingInvoices = this.invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE');
    const overdueAmount = pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const openMaintenanceTickets = this.maintenance.filter((m) => m.status !== 'RESOLVED').length;

    const paidInvoicesCount = this.invoices.filter((i) => i.status === 'PAID').length;
    const pendingInvoicesCount = this.invoices.filter((i) => i.status === 'PENDING').length;
    const overdueInvoicesCount = this.invoices.filter((i) => i.status === 'OVERDUE').length;

    return {
      metrics: {
        totalRevenue: 94000,
        pendingPayments: overdueAmount,
        occupancyRate,
        occupiedBeds,
        totalCapacity: totalBeds,
        availableRooms: this.rooms.filter((r) => r.status === 'Available').length,
        totalResidents,
        pendingMaintenance: openMaintenanceTickets,
      },
      revenueChart: [
        { month: 'Mar', amount: 72000 },
        { month: 'Apr', amount: 78000 },
        { month: 'May', amount: 81000 },
        { month: 'Jun', amount: 84000 },
        { month: 'Jul', amount: 89000 },
        { month: 'Aug', amount: 94000 },
      ],
      occupancyChart: [
        { category: 'Single', occupied: 1, capacity: 1 },
        { category: 'Double', occupied: 3, capacity: 6 },
        { category: 'Triple', occupied: 3, capacity: 3 },
        { category: 'Deluxe', occupied: 0, capacity: 1 },
      ],
      paymentStatusPie: [
        { name: 'Paid Invoices', value: paidInvoicesCount || 2 },
        { name: 'Pending Rent', value: pendingInvoicesCount || 1 },
        { name: 'Overdue Dues', value: overdueInvoicesCount || 0 },
      ],
      recentTransactions: [
        { id: 'tx-1', residentName: 'Rohan Mehta', paymentMethod: 'PhonePe UPI', amount: 9000, status: 'SUCCESS' },
        { id: 'tx-2', residentName: 'Aarav Sharma', paymentMethod: 'PhonePe UPI', amount: 9200, status: 'SUCCESS' },
        { id: 'tx-3', residentName: 'Vikramaditya Singh', paymentMethod: 'Bank Transfer', amount: 12000, status: 'SUCCESS' },
      ],
      totalRooms,
      occupiedRooms: this.rooms.filter((r) => r.occupancy > 0).length,
      availableRooms: this.rooms.filter((r) => r.status === 'Available').length,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      totalResidents,
      pendingInvoicesCount: pendingInvoices.length,
      overdueAmount,
      openMaintenanceTickets,
    };
  }

  // ROOMS CRUD
  public getRooms() {
    return this.rooms;
  }

  public addRoom(data: Partial<Room>) {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      roomNumber: data.roomNumber || '999',
      floor: data.floor || 1,
      category: data.category || 'Double',
      capacity: data.capacity || 2,
      occupancy: 0,
      monthlyRent: data.monthlyRent || 8500,
      status: data.status || 'Available',
      amenities: data.amenities || ['Wi-Fi'],
      residents: [],
    };
    this.rooms.unshift(newRoom);
    this.saveToStorage();
    return newRoom;
  }

  public updateRoom(id: string, data: Partial<Room>) {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.rooms[index] = { ...this.rooms[index], ...data };
      this.saveToStorage();
      return this.rooms[index];
    }
    throw new Error('Room not found');
  }

  public deleteRoom(id: string) {
    this.rooms = this.rooms.filter((r) => r.id !== id);
    this.saveToStorage();
    return { success: true };
  }

  // RESIDENTS CRUD
  public getResidents() {
    return this.residents;
  }

  public addResident(data: Partial<Resident>) {
    const newRes: Resident = {
      id: `res-${Date.now()}`,
      name: data.name || 'New Resident',
      email: data.email || 'resident@example.com',
      phone: data.phone || '9876543210',
      emergencyContact: data.emergencyContact || '',
      roomId: data.roomId || undefined,
      roomNumber: undefined,
      bedNumber: data.bedNumber || 'A',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      depositAmount: data.depositAmount || 8500,
      status: data.status || 'ACTIVE',
      profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`,
      documents: data.documents || {
        aadhaarUrl: 'https://picsum.photos/seed/aadhaar/400/250',
        panUrl: 'https://picsum.photos/seed/pan/400/250',
        status: 'VERIFIED',
      },
    };

    // Allocate room if selected
    if (data.roomId) {
      const room = this.rooms.find((r) => r.id === data.roomId);
      if (room) {
        newRes.roomNumber = room.roomNumber;
        room.occupancy = Math.min(room.capacity, room.occupancy + 1);
        if (room.occupancy >= room.capacity) room.status = 'Fully Occupied';
        room.residents = room.residents || [];
        room.residents.push({ id: newRes.id, name: newRes.name, bedNumber: newRes.bedNumber });
      }
    }

    this.residents.unshift(newRes);
    this.saveToStorage();
    return newRes;
  }

  public updateResident(id: string, data: Partial<Resident>) {
    const index = this.residents.findIndex((r) => r.id === id);
    if (index !== -1) {
      const oldRoomId = this.residents[index].roomId;
      this.residents[index] = { ...this.residents[index], ...data };

      // Handle room re-allocation
      if (data.roomId && data.roomId !== oldRoomId) {
        const newRoom = this.rooms.find((r) => r.id === data.roomId);
        if (newRoom) {
          this.residents[index].roomNumber = newRoom.roomNumber;
        }
      }

      this.saveToStorage();
      return this.residents[index];
    }
    throw new Error('Resident not found');
  }

  public deleteResident(id: string) {
    this.residents = this.residents.filter((r) => r.id !== id);
    this.saveToStorage();
    return { success: true };
  }

  // STAFF CRUD
  public getStaff() {
    return this.staff;
  }

  public addStaff(data: Partial<Staff>) {
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: data.name || 'Staff Member',
      email: data.email || 'staff@example.com',
      phone: data.phone || '9876543210',
      role: data.role || 'Cleaner',
      shift: data.shift || 'Full Time',
      salary: data.salary || 18000,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      status: data.status || 'ACTIVE',
    };
    this.staff.unshift(newStaff);
    this.saveToStorage();
    return newStaff;
  }

  public updateStaff(id: string, data: Partial<Staff>) {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.staff[index] = { ...this.staff[index], ...data };
      this.saveToStorage();
      return this.staff[index];
    }
    throw new Error('Staff member not found');
  }

  public deleteStaff(id: string) {
    this.staff = this.staff.filter((s) => s.id !== id);
    this.saveToStorage();
    return { success: true };
  }

  // INVOICES & BILLING
  public getInvoices() {
    return this.invoices;
  }

  public getRecurringBillingSettings() {
    return this.recurringBillingSettings;
  }

  public setRecurringBillingSettings(data: Partial<RecurringBillingSettings>) {
    this.recurringBillingSettings = { ...this.recurringBillingSettings, ...data };
    this.saveToStorage();
    return this.recurringBillingSettings;
  }

  public toggleRecurringBilling(enabled?: boolean) {
    const nextState = enabled !== undefined ? enabled : !this.recurringBillingSettings.enabled;
    this.recurringBillingSettings.enabled = nextState;
    this.saveToStorage();
    return this.recurringBillingSettings;
  }

  public async sendInvoiceSmsReminder(invoiceId: string, triggeredBy = 'Admin Manual Reminder') {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const resident = this.residents.find((r) => r.id === inv.residentId || r.name === inv.residentName);
    const phone = resident?.phone || '9876512345';
    
    const isOverdue = inv.status === 'OVERDUE' || (inv.status === 'PENDING' && new Date(inv.dueDate) < new Date());
    const prefix = isOverdue ? '🚨 URGENT OVERDUE PAYMENT REMINDER' : '📢 RENT PAYMENT REMINDER';
    const smsMessage = `Grand Horizon Hostel: ${prefix} for ${inv.residentName} (Room ${inv.roomNumber}). Rent amount of ₹${(inv.totalAmount || 0).toLocaleString('en-IN')} for ${inv.month} ${inv.year} is ${isOverdue ? 'OVERDUE' : 'due on ' + inv.dueDate}. Please clear your dues via PhonePe on resident portal or scan UPI QR code.`;

    return await this.sendCustomSms(inv.residentName, phone, smsMessage, 'PAYMENT_DUE', triggeredBy);
  }

  public generateBatchInvoices(month: string, year: number) {
    let count = 0;
    const activeResidents = this.residents.filter((r) => r.status === 'ACTIVE' && r.roomId);

    activeResidents.forEach((res) => {
      const exists = this.invoices.some(
        (i) => i.residentId === res.id && i.month === month && i.year === year
      );

      if (!exists) {
        const room = this.rooms.find((r) => r.id === res.roomId);
        const rent = room ? room.monthlyRent : 8500;
        const electricityUnits = Math.floor(Math.random() * 30) + 20;
        const electricityCharges = electricityUnits * 10;
        const waterCharges = 200;
        const totalAmount = rent + electricityCharges + waterCharges;
        const dueDate = `${year}-08-10`;

        this.invoices.unshift({
          id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          invoiceNumber: `INV-${year}-${Math.floor(Math.random() * 8999 + 1000)}`,
          residentId: res.id,
          residentName: res.name,
          roomNumber: res.roomNumber || '101',
          month,
          year,
          rentAmount: rent,
          electricityUnits,
          electricityCharges,
          waterCharges,
          fine: 0,
          totalAmount,
          dueDate,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
        count++;

        // Trigger SMS notification if enabled
        if (this.smsSettings.enabled && this.smsSettings.notifyOnInvoiceCreated && res.phone) {
          const smsText = buildPaymentDueSmsText(res.name, totalAmount, dueDate, res.roomNumber);
          this.sendCustomSms(res.name, res.phone, smsText, 'PAYMENT_DUE', 'Auto Billing Engine');
        }
      }
    });

    this.saveToStorage();
    return { success: true, message: `Successfully generated ${count} new invoice(s) for ${month} ${year}.` };
  }

  public processPhonePePayment(invoiceId: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (inv) {
      inv.status = 'PAID';
      inv.paymentDate = new Date().toISOString();

      // Trigger payment confirmation SMS
      const res = this.residents.find((r) => r.id === inv.residentId);
      if (this.smsSettings.enabled && this.smsSettings.notifyOnPaymentReceived && res?.phone) {
        const smsText = `Grand Horizon Hostel: Payment confirmed! Received ₹${inv.totalAmount.toLocaleString('en-IN')} for Invoice ${inv.invoiceNumber} (${inv.month} ${inv.year}). Thank you!`;
        this.sendCustomSms(res.name, res.phone, smsText, 'PAYMENT_DUE', 'PhonePe Gateway');
      }

      this.saveToStorage();
      return { success: true, invoice: inv };
    }
    throw new Error('Invoice not found');
  }

  // MAINTENANCE
  public getMaintenance() {
    return this.maintenance;
  }

  public createMaintenance(data: Partial<MaintenanceRequest>) {
    const newTicket: MaintenanceRequest = {
      id: `m-${Date.now()}`,
      residentId: data.residentId || 'res-101',
      residentName: data.residentName || 'Aarav Sharma',
      roomId: data.roomId || 'room-101',
      roomNumber: data.roomNumber || '101',
      title: data.title || 'General Repair',
      category: data.category || 'Plumbing',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.maintenance.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  public updateMaintenance(id: string, data: Partial<MaintenanceRequest>) {
    const index = this.maintenance.findIndex((m) => m.id === id);
    if (index !== -1) {
      const oldTicket = this.maintenance[index];
      this.maintenance[index] = { ...oldTicket, ...data };

      // Trigger SMS notification to resident if status or assigned staff changed
      if (
        this.smsSettings.enabled &&
        this.smsSettings.notifyOnMaintenanceUpdate &&
        data.status &&
        data.status !== oldTicket.status
      ) {
        const res = this.residents.find((r) => r.id === oldTicket.residentId);
        const phone = res?.phone || '9876512345';
        const smsText = buildMaintenanceUpdateSmsText(
          oldTicket.residentName,
          oldTicket.title,
          data.status,
          oldTicket.roomNumber
        );
        this.sendCustomSms(oldTicket.residentName, phone, smsText, 'MAINTENANCE_UPDATE', 'Maintenance Desk');
      }

      this.saveToStorage();
      return this.maintenance[index];
    }
    throw new Error('Maintenance request not found');
  }

  // SMS MANAGEMENT
  public getSmsLogs() {
    return this.smsLogs;
  }

  public getSmsSettings() {
    const twilioStatus = checkTwilioConfiguration();
    return {
      ...this.smsSettings,
      twilioConfigured: twilioStatus.configured,
    };
  }

  public updateSmsSettings(settings: Partial<SmsSettings>) {
    this.smsSettings = { ...this.smsSettings, ...settings };
    this.saveToStorage();
    return this.smsSettings;
  }

  public async sendCustomSms(
    recipientName: string,
    phone: string,
    message: string,
    type: SmsLog['type'] = 'CUSTOM',
    triggeredBy = 'Admin Action'
  ) {
    const res = await sendSmsNotification({
      toPhone: phone,
      recipientName,
      message,
      type,
      triggeredBy,
    });

    const newLog: SmsLog = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientName,
      phone,
      type,
      message,
      status: res.status,
      sentAt: new Date().toISOString(),
      sid: res.sid,
      triggeredBy,
    };

    this.smsLogs.unshift(newLog);
    this.saveToStorage();
    return { ...res, log: newLog };
  }

  public async broadcastSmsToAll(
    headline: string,
    messageBody: string,
    triggeredBy = 'Admin Broadcast'
  ) {
    const activeResidents = this.residents.filter((r) => r.status === 'ACTIVE');
    const fullSmsText = buildEmergencyBroadcastSmsText(headline, messageBody);

    let deliveredCount = 0;
    const sids: string[] = [];

    for (const res of activeResidents) {
      if (res.phone) {
        const result = await sendSmsNotification({
          toPhone: res.phone,
          recipientName: res.name,
          message: fullSmsText,
          type: 'EMERGENCY_BROADCAST',
          triggeredBy,
        });
        if (result.success) deliveredCount++;
        sids.push(result.sid);
      }
    }

    // Add summary log for broadcast
    const broadcastLog: SmsLog = {
      id: `sms-bcast-${Date.now()}`,
      recipientName: `All Active Residents (${activeResidents.length})`,
      phone: 'BROADCAST_GROUP',
      type: 'EMERGENCY_BROADCAST',
      message: fullSmsText,
      status: checkTwilioConfiguration().configured ? 'DELIVERED' : 'SIMULATED',
      sentAt: new Date().toISOString(),
      sid: sids[0] || `SM_BCAST_${Date.now()}`,
      triggeredBy,
    };

    this.smsLogs.unshift(broadcastLog);
    
    // Also add to internal system notifications
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `🚨 ${headline}`,
      message: messageBody,
      createdAt: new Date().toISOString(),
      target: 'ALL',
    });

    this.saveToStorage();
    return {
      success: true,
      recipientCount: activeResidents.length,
      deliveredCount,
      message: `Emergency SMS Broadcast dispatched to ${activeResidents.length} resident(s).`,
      log: broadcastLog,
    };
  }

  // SMS TEMPLATES LIBRARY
  public getSmsTemplates(): SmsTemplate[] {
    return this.smsTemplates;
  }

  public addSmsTemplate(template: Omit<SmsTemplate, 'id'>): SmsTemplate {
    const newTmpl: SmsTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSystem: false,
    };
    this.smsTemplates.unshift(newTmpl);
    this.saveToStorage();
    return newTmpl;
  }

  public updateSmsTemplate(id: string, updates: Partial<SmsTemplate>): SmsTemplate {
    const idx = this.smsTemplates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.smsTemplates[idx] = { ...this.smsTemplates[idx], ...updates };
      this.saveToStorage();
      return this.smsTemplates[idx];
    }
    throw new Error('Template not found');
  }

  public deleteSmsTemplate(id: string): void {
    this.smsTemplates = this.smsTemplates.filter((t) => t.id !== id);
    this.saveToStorage();
  }

  // PAYMENT SETTINGS
  public getPaymentSettings(): PaymentSettings {
    return this.paymentSettings;
  }

  public updatePaymentSettings(updates: Partial<PaymentSettings>): PaymentSettings {
    this.paymentSettings = { ...this.paymentSettings, ...updates };
    this.saveToStorage();
    return this.paymentSettings;
  }

  // FLOOR WI-FI MANAGEMENT
  public getFloorWifis(): FloorWifi[] {
    return this.floorWifis;
  }

  public getWifiByFloor(floor: number): FloorWifi {
    const found = this.floorWifis.find((w) => Number(w.floor) === Number(floor));
    if (found) return found;
    return {
      floor: Number(floor),
      ssid: floor === 1 ? 'GrandHorizon_Resident' : `GrandHorizon_Fl${floor}_5G`,
      password: 'Fiber1Gbps#2026',
      speed: '1 Gbps Fiber',
      frequency: '5 GHz Dual-Band',
      notes: `Floor ${floor} High-Speed Mesh Access Point`,
    };
  }

  public updateFloorWifi(floor: number, updates: Partial<FloorWifi>): FloorWifi {
    const floorNum = Number(floor);
    const idx = this.floorWifis.findIndex((w) => Number(w.floor) === floorNum);
    if (idx !== -1) {
      this.floorWifis[idx] = { ...this.floorWifis[idx], ...updates, floor: floorNum };
    } else {
      const newWifi: FloorWifi = {
        floor: floorNum,
        ssid: updates.ssid || (floorNum === 1 ? 'GrandHorizon_Resident' : `GrandHorizon_Fl${floorNum}_5G`),
        password: updates.password || 'Fiber1Gbps#2026',
        speed: updates.speed || '1 Gbps Fiber',
        frequency: updates.frequency || '5 GHz Dual-Band',
        notes: updates.notes || `Floor ${floorNum} High-Speed Mesh Access Point`,
      };
      this.floorWifis.push(newWifi);
    }
    this.saveToStorage();
    return this.getWifiByFloor(floorNum);
  }

  public deleteFloorWifi(floor: number): void {
    this.floorWifis = this.floorWifis.filter((w) => Number(w.floor) !== Number(floor));
    this.saveToStorage();
  }


  // NOTIFICATIONS
  public getNotifications() {
    return this.notifications;
  }

  // REPORTS
  public getReport(type: string, startDate?: string, endDate?: string) {
    if (type === 'revenue') {
      return {
        summary: {
          totalCollected: 183000,
          pendingDues: 9150,
          activeInvoices: this.invoices.length,
        },
        rows: this.invoices.map((i) => ({
          InvoiceNo: i.invoiceNumber,
          Resident: i.residentName,
          Room: i.roomNumber,
          Month: `${i.month} ${i.year}`,
          TotalAmount: i.totalAmount,
          Status: i.status,
          DueDate: i.dueDate,
        })),
      };
    } else if (type === 'occupancy') {
      return {
        summary: {
          totalRooms: this.rooms.length,
          occupiedRooms: this.rooms.filter((r) => r.occupancy > 0).length,
          availableRooms: this.rooms.filter((r) => r.status === 'Available').length,
        },
        rows: this.rooms.map((r) => ({
          RoomNumber: r.roomNumber,
          Floor: r.floor,
          Category: r.category,
          Capacity: r.capacity,
          Occupancy: r.occupancy,
          RentTariff: r.monthlyRent,
          Status: r.status,
        })),
      };
    } else if (type === 'residents') {
      return {
        summary: {
          totalRegistered: this.residents.length,
          verifiedKYC: this.residents.filter((r) => r.documents?.status === 'VERIFIED').length,
        },
        rows: this.residents.map((r) => ({
          Name: r.name,
          Email: r.email,
          Phone: r.phone,
          RoomNumber: r.roomNumber || 'N/A',
          BedNumber: r.bedNumber || 'N/A',
          JoinDate: r.joinDate,
          Status: r.status,
        })),
      };
    } else {
      return {
        summary: {
          totalTickets: this.maintenance.length,
          openTickets: this.maintenance.filter((m) => m.status !== 'RESOLVED').length,
          resolvedTickets: this.maintenance.filter((m) => m.status === 'RESOLVED').length,
        },
        rows: this.maintenance.map((m) => ({
          TicketID: m.id,
          Title: m.title,
          Category: m.category,
          Resident: m.residentName,
          Room: m.roomNumber,
          Priority: m.priority,
          Status: m.status,
          AssignedTo: m.assignedStaffName || 'Unassigned',
        })),
      };
    }
  }
}

export const hostelStore = new HostelStore();

// Intercept window.fetch calls to /api/* so client SPA runs completely standalone without 404s
export function setupMockFetchInterceptor() {
  if (typeof window === 'undefined') return;

  try {
    const originalFetch = window.fetch;
    if ((window as any).__mockFetchInstalled) return;

    const mockFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      if (urlString.startsWith('/api/') || urlString.includes('/api/')) {
        const cleanPath = urlString.split('?')[0];
        const method = (init?.method || 'GET').toUpperCase();

        let bodyData: any = {};
        if (init?.body) {
          try {
            bodyData = JSON.parse(init.body as string);
          } catch (e) {
            // ignore
          }
        }

        // Helper to wrap JSON response
        const jsonResponse = (data: any, status = 200) =>
          Promise.resolve(
            new Response(JSON.stringify(data), {
              status,
              headers: { 'Content-Type': 'application/json' },
            })
          );

        // ROUTE MATCHERS
        if (cleanPath === '/api/dashboard') {
          return jsonResponse(hostelStore.getDashboardStats());
        }

        if (cleanPath === '/api/rooms') {
          if (method === 'GET') return jsonResponse(hostelStore.getRooms());
          if (method === 'POST') return jsonResponse(hostelStore.addRoom(bodyData));
        }

        if (cleanPath.startsWith('/api/rooms/')) {
          const id = cleanPath.replace('/api/rooms/', '');
          if (method === 'PUT') return jsonResponse(hostelStore.updateRoom(id, bodyData));
          if (method === 'DELETE') return jsonResponse(hostelStore.deleteRoom(id));
        }

        if (cleanPath === '/api/residents') {
          if (method === 'GET') return jsonResponse(hostelStore.getResidents());
          if (method === 'POST') return jsonResponse(hostelStore.addResident(bodyData));
        }

        if (cleanPath.startsWith('/api/residents/')) {
          const id = cleanPath.replace('/api/residents/', '');
          if (method === 'PUT') return jsonResponse(hostelStore.updateResident(id, bodyData));
          if (method === 'DELETE') return jsonResponse(hostelStore.deleteResident(id));
        }

        if (cleanPath === '/api/staff') {
          if (method === 'GET') return jsonResponse(hostelStore.getStaff());
          if (method === 'POST') return jsonResponse(hostelStore.addStaff(bodyData));
        }

        if (cleanPath.startsWith('/api/staff/')) {
          const id = cleanPath.replace('/api/staff/', '');
          if (method === 'PUT') return jsonResponse(hostelStore.updateStaff(id, bodyData));
          if (method === 'DELETE') return jsonResponse(hostelStore.deleteStaff(id));
        }

        if (cleanPath === '/api/invoices') {
          if (method === 'GET') return jsonResponse(hostelStore.getInvoices());
        }

        if (cleanPath === '/api/invoices/generate') {
          if (method === 'POST')
            return jsonResponse(hostelStore.generateBatchInvoices(bodyData.month || 'August', bodyData.year || 2026));
        }

        if (cleanPath === '/api/invoices/recurring') {
          if (method === 'GET') return jsonResponse(hostelStore.getRecurringBillingSettings());
          if (method === 'POST' || method === 'PUT') {
            if (typeof bodyData.enabled === 'boolean') {
              return jsonResponse(hostelStore.setRecurringBillingSettings(bodyData));
            }
            return jsonResponse(hostelStore.toggleRecurringBilling());
          }
        }

        if (cleanPath === '/api/invoices/send-reminder') {
          if (method === 'POST') {
            const res = await hostelStore.sendInvoiceSmsReminder(bodyData.invoiceId, bodyData.triggeredBy);
            return jsonResponse(res);
          }
        }

        if (cleanPath === '/api/maintenance') {
          if (method === 'GET') return jsonResponse(hostelStore.getMaintenance());
          if (method === 'POST') return jsonResponse(hostelStore.createMaintenance(bodyData));
        }

        if (cleanPath.startsWith('/api/maintenance/')) {
          const id = cleanPath.replace('/api/maintenance/', '');
          if (method === 'PUT') return jsonResponse(hostelStore.updateMaintenance(id, bodyData));
        }

        if (cleanPath === '/api/notifications') {
          return jsonResponse(hostelStore.getNotifications());
        }

        if (cleanPath === '/api/reports') {
          const urlObj = new URL(urlString, window.location.origin);
          const type = urlObj.searchParams.get('type') || 'revenue';
          const startDate = urlObj.searchParams.get('startDate') || '';
          const endDate = urlObj.searchParams.get('endDate') || '';
          return jsonResponse(hostelStore.getReport(type, startDate, endDate));
        }

        if (cleanPath === '/api/payments/phonepe/callback') {
          if (bodyData.invoiceId) {
            return jsonResponse(hostelStore.processPhonePePayment(bodyData.invoiceId));
          }
          return jsonResponse({ success: true, message: 'Payment recorded successfully' });
        }

        if (cleanPath === '/api/payments/settings') {
          if (method === 'GET') return jsonResponse(hostelStore.getPaymentSettings());
          if (method === 'POST' || method === 'PUT') return jsonResponse(hostelStore.updatePaymentSettings(bodyData));
        }

        // FLOOR WI-FI API
        if (cleanPath === '/api/wifi/floors') {
          if (method === 'GET') return jsonResponse(hostelStore.getFloorWifis());
          if (method === 'POST' || method === 'PUT') {
            const updated = hostelStore.updateFloorWifi(bodyData.floor, bodyData);
            return jsonResponse(updated);
          }
        }

        if (cleanPath.startsWith('/api/wifi/floors/')) {
          const floorNum = Number(cleanPath.replace('/api/wifi/floors/', ''));
          if (method === 'GET') return jsonResponse(hostelStore.getWifiByFloor(floorNum));
          if (method === 'PUT') return jsonResponse(hostelStore.updateFloorWifi(floorNum, bodyData));
          if (method === 'DELETE') {
            hostelStore.deleteFloorWifi(floorNum);
            return jsonResponse({ success: true });
          }
        }

        if (cleanPath === '/api/auth/forgot-password') {
          return jsonResponse({ success: true, message: 'Password recovery email sent successfully' });
        }

        // SMS API Endpoints
        if (cleanPath === '/api/sms/logs') {
          return jsonResponse(hostelStore.getSmsLogs());
        }

        if (cleanPath === '/api/sms/templates') {
          if (method === 'GET') return jsonResponse(hostelStore.getSmsTemplates());
          if (method === 'POST') return jsonResponse(hostelStore.addSmsTemplate(bodyData));
        }

        if (cleanPath.startsWith('/api/sms/templates/')) {
          const id = cleanPath.replace('/api/sms/templates/', '');
          if (method === 'PUT') return jsonResponse(hostelStore.updateSmsTemplate(id, bodyData));
          if (method === 'DELETE') {
            hostelStore.deleteSmsTemplate(id);
            return jsonResponse({ success: true });
          }
        }

        if (cleanPath === '/api/sms/settings') {
          if (method === 'GET') return jsonResponse(hostelStore.getSmsSettings());
          if (method === 'PUT') return jsonResponse(hostelStore.updateSmsSettings(bodyData));
        }

        if (cleanPath === '/api/sms/send') {
          const res = await hostelStore.sendCustomSms(
            bodyData.recipientName || 'Resident',
            bodyData.phone || '9876543210',
            bodyData.message || 'SMS Alert',
            bodyData.type || 'CUSTOM',
            bodyData.triggeredBy || 'Admin Action'
          );
          return jsonResponse(res);
        }

        if (cleanPath === '/api/sms/broadcast') {
          const res = await hostelStore.broadcastSmsToAll(
            bodyData.headline || 'URGENT NOTICE',
            bodyData.message || 'Important hostel announcement.',
            bodyData.triggeredBy || 'Admin Broadcast'
          );
          return jsonResponse(res);
        }

        // Default fallback for any other API route
        return jsonResponse({ message: 'Success' });
      }

      return originalFetch.apply(window, [input, init]);
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: mockFetch,
        writable: true,
        configurable: true,
      });
      (window as any).__mockFetchInstalled = true;
    } catch (err) {
      console.warn('Could not override window.fetch with defineProperty:', err);
    }
  } catch (e) {
    console.error('Failed to setup mock fetch interceptor', e);
  }
}
