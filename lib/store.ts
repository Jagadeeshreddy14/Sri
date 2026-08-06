import { Room, Resident, Staff, Invoice, MaintenanceRequest, Notification } from './types';

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

class HostelStore {
  private rooms: Room[] = [];
  private residents: Resident[] = [];
  private staff: Staff[] = [];
  private invoices: Invoice[] = [];
  private maintenance: MaintenanceRequest[] = [];
  private notifications: Notification[] = [];

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
          dueDate: `${year}-08-10`,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
        count++;
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
      this.maintenance[index] = { ...this.maintenance[index], ...data };
      this.saveToStorage();
      return this.maintenance[index];
    }
    throw new Error('Maintenance request not found');
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

        if (cleanPath === '/api/auth/forgot-password') {
          return jsonResponse({ success: true, message: 'Password recovery email sent successfully' });
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
