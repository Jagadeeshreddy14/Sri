import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import {
  sendSmsNotification,
  buildPaymentDueSmsText,
  buildMaintenanceUpdateSmsText,
  buildEmergencyBroadcastSmsText,
  checkTwilioConfiguration,
} from './lib/sms-service';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------- MONGODB CONNECTION -----------------
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://jagadeesh:8074563501@cluster0.ur44l.mongodb.net/sri';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas.');
    seedDatabase();
  })
  .catch((err: any) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// ----------------- MONGOOSE SCHEMAS & MODELS -----------------

// User (For Authentication)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident', 'staff'], default: 'resident' },
  roomNumber: { type: String },
  roomId: { type: String },
  phone: { type: String },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

// Room
const RoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNumber: { type: String, required: true },
  category: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupancy: { type: Number, required: true, default: 0 },
  monthlyRent: { type: Number, required: true },
  amenities: [{ type: String }],
  status: { type: String, required: true },
  floor: { type: Number, required: true },
  residents: [{
    id: String,
    name: String,
    bedNumber: String
  }]
}, { timestamps: true });
const Room = mongoose.model('Room', RoomSchema);

// Resident
const ResidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  roomNumber: { type: String },
  roomId: { type: String },
  bedNumber: { type: String },
  rentStatus: { type: String },
  joinDate: { type: String },
  emergencyContact: { type: String },
  kycVerified: { type: Boolean, default: false },
  monthFee: { type: Number },
  depositAmount: { type: Number },
  status: { type: String, default: 'ACTIVE' },
  profileImage: { type: String },
  documents: {
    aadhaarUrl: { type: String },
    panUrl: { type: String },
    status: { type: String, default: 'PENDING' }
  }
}, { timestamps: true });
const Resident = mongoose.model('Resident', ResidentSchema);

// Staff
const StaffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  shift: { type: String },
  status: { type: String, default: 'ACTIVE' },
  assignedTicketsCount: { type: Number, default: 0 },
  salary: { type: Number },
  joinDate: { type: String }
}, { timestamps: true });
const Staff = mongoose.model('Staff', StaffSchema);

// Invoice
const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: { type: String },
  residentId: { type: String, required: true },
  residentName: { type: String, required: true },
  roomNumber: { type: String },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  rentAmount: { type: Number, required: true },
  utilityAmount: { type: Number },
  electricityUnits: { type: Number },
  electricityCharges: { type: Number },
  waterCharges: { type: Number },
  fine: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING' },
  dueDate: { type: String, required: true },
  paidAt: { type: String },
  paymentDate: { type: String },
  paymentMethod: { type: String },
  transactionId: { type: String },
  createdAt: { type: String }
}, { timestamps: true });
const Invoice = mongoose.model('Invoice', InvoiceSchema);

// Maintenance Request
const MaintenanceRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  residentId: { type: String, required: true },
  residentName: { type: String, required: true },
  roomId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, required: true, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  status: { type: String, required: true, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'], default: 'PENDING' },
  createdAt: { type: String },
  assignedStaffId: { type: String, default: null },
  assignedStaffName: { type: String, default: null }
}, { timestamps: true });
const MaintenanceRequest = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);

// Notification
const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, default: 'ALL' },
  target: { type: String, default: 'ALL' },
  createdAt: { type: String }
}, { timestamps: true });
const Notification = mongoose.model('Notification', NotificationSchema);

// SMS Log
const SmsLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  sentAt: { type: String },
  sid: { type: String },
  triggeredBy: { type: String }
}, { timestamps: true });
const SmsLog = mongoose.model('SmsLog', SmsLogSchema);

// SMS Settings (Singleton document)
const SmsSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  notifyOnInvoiceCreated: { type: Boolean, default: true },
  notifyOnPaymentOverdue: { type: Boolean, default: true },
  notifyOnMaintenanceUpdate: { type: Boolean, default: true },
  notifyOnPaymentReceived: { type: Boolean, default: true },
  emergencyBroadcastsEnabled: { type: Boolean, default: true },
  twilioConfigured: { type: Boolean, default: false }
});
const SmsSettings = mongoose.model('SmsSettings', SmsSettingsSchema);

// Recurring Billing Settings (Singleton document)
const RecurringBillingSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  scheduleDay: { type: Number, default: 1 },
  autoSendSms: { type: Boolean, default: true },
  lastRunDate: { type: String },
  nextRunDate: { type: String }
});
const RecurringBillingSettings = mongoose.model('RecurringBillingSettings', RecurringBillingSettingsSchema);

// SMS Template
const SmsTemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  headline: { type: String },
  body: { type: String, required: true },
  isSystem: { type: Boolean, default: false },
  createdAt: { type: String }
});
const SmsTemplate = mongoose.model('SmsTemplate', SmsTemplateSchema);

// Payment Settings (Singleton document)
const PaymentSettingsSchema = new mongoose.Schema({
  merchantName: { type: String },
  merchantUpiVpa: { type: String },
  bankAccountName: { type: String },
  bankName: { type: String },
  bankAccountNumber: { type: String },
  ifscCode: { type: String },
  phonePeQrEnabled: { type: Boolean, default: true },
  upiCollectEnabled: { type: Boolean, default: true },
  cashPaymentEnabled: { type: Boolean, default: true },
  rentDueDay: { type: Number, default: 10 },
  gracePeriodDays: { type: Number, default: 3 },
  lateFeePerDay: { type: Number, default: 50 },
  autoApplyLateFee: { type: Boolean, default: true },
  autoSendPaymentReceiptSms: { type: Boolean, default: true },
  includeQrInSmsReminder: { type: Boolean, default: true }
});
const PaymentSettings = mongoose.model('PaymentSettings', PaymentSettingsSchema);

// Floor Wi-Fi
const FloorWifiSchema = new mongoose.Schema({
  floor: { type: Number, required: true, unique: true },
  ssid: { type: String, required: true },
  password: { type: String, required: true },
  speed: { type: String },
  frequency: { type: String },
  notes: { type: String }
});
const FloorWifi = mongoose.model('FloorWifi', FloorWifiSchema);

// Hostel Info (Singleton document)
const HostelInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  establishedYear: { type: String },
  gstin: { type: String }
});
const HostelInfo = mongoose.model('HostelInfo', HostelInfoSchema);


// ----------------- SEED DATABASE LOGIC -----------------
async function seedDatabase() {
  try {
    // If Admin user exists, database is already initialized.
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      console.log('Database already initialized. Skipping seeding.');
      return;
    }

    console.log('Clearing database and seeding default settings and accounts...');

    // Clear collections
    await User.deleteMany({});
    await Room.deleteMany({});
    await Resident.deleteMany({});
    await Staff.deleteMany({});
    await Invoice.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    await Notification.deleteMany({});
    await SmsLog.deleteMany({});
    await SmsSettings.deleteMany({});
    await RecurringBillingSettings.deleteMany({});
    await SmsTemplate.deleteMany({});
    await PaymentSettings.deleteMany({});
    await FloorWifi.deleteMany({});
    await HostelInfo.deleteMany({});

    // Seed default credentials
    const adminPassword = await bcrypt.hash('123456', 10);

    await User.insertMany([
      {
        id: 'admin-jagadeesh',
        name: 'Jagadeesh (Admin)',
        email: 'nallamaplujagadeeshreddy@gmail.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91 80745 63501'
      }
    ]);
    // Singleton Settings documents
    await SmsSettings.create({
      enabled: true,
      notifyOnInvoiceCreated: true,
      notifyOnPaymentOverdue: true,
      notifyOnMaintenanceUpdate: true,
      notifyOnPaymentReceived: true,
      emergencyBroadcastsEnabled: true,
      twilioConfigured: checkTwilioConfiguration().configured,
    });

   

   

    

    

    console.log('Default settings and admin credentials seeded successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}


// ----------------- API ENDPOINTS IMPLEMENTATION -----------------

// Authentication API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, roomNumber } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const userId = `resident-${Date.now()}`;

    // Create User Document
    const newUser = await User.create({
      id: userId,
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: 'resident',
      phone: phone || '+91 98765 43210',
      roomNumber: roomNumber || '101'
    });

    // Create corresponding Resident Document
    const newRes = await Resident.create({
      id: userId,
      name,
      email: cleanEmail,
      phone: phone || '9876543210',
      emergencyContact: '9876500000',
      roomNumber: roomNumber || '101',
      depositAmount: 8500,
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
      profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
    });

    // Allocate room in Room model
    if (roomNumber) {
      const room = await Room.findOne({ roomNumber });
      if (room) {
        room.occupancy = Math.min(room.capacity, room.occupancy + 1);
        if (room.occupancy >= room.capacity) room.status = 'Fully Occupied';
        room.residents.push({ id: userId, name, bedNumber: 'A' });
        await room.save();
        newRes.roomId = room.id;
        await newRes.save();
        newUser.roomId = room.id;
        await newUser.save();
      }
    }

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      roomNumber: newUser.roomNumber,
      roomId: newUser.roomId
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      roomNumber: user.roomNumber,
      roomId: user.roomId
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Password recovery email sent successfully' });
});

// Dashboard metrics endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const rooms = await Room.find();
    const residents = await Resident.find({ status: 'ACTIVE' });
    const invoices = await Invoice.find();
    const maintenance = await MaintenanceRequest.find();
    const floorWifis = await FloorWifi.find();

    const totalRooms = rooms.length;
    let totalBeds = 0;
    let occupiedBeds = 0;

    rooms.forEach((r) => {
      totalBeds += r.capacity;
      occupiedBeds += r.occupancy;
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const pendingInvoices = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE');
    const overdueAmount = pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const openMaintenanceTickets = maintenance.filter((m) => m.status !== 'RESOLVED').length;

    const paidInvoicesCount = invoices.filter((i) => i.status === 'PAID').length;
    const pendingInvoicesCount = invoices.filter((i) => i.status === 'PENDING').length;
    const overdueInvoicesCount = invoices.filter((i) => i.status === 'OVERDUE').length;

    const paidInvoices = invoices.filter((i) => i.status === 'PAID');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    const recentTransactions = paidInvoices
      .sort((a, b) => new Date(b.paymentDate || '').getTime() - new Date(a.paymentDate || '').getTime())
      .slice(0, 5)
      .map(i => ({
        id: i.id,
        residentName: i.residentName,
        paymentMethod: i.paymentMethod || 'PhonePe UPI',
        amount: i.totalAmount,
        status: 'SUCCESS'
      }));

    res.json({
      metrics: {
        totalRevenue,
        pendingPayments: overdueAmount,
        occupancyRate,
        occupiedBeds,
        totalCapacity: totalBeds,
        availableRooms: rooms.filter((r) => r.status === 'Available').length,
        totalResidents: residents.length,
        pendingMaintenance: openMaintenanceTickets,
        activeWifiCount: floorWifis.length || 4,
        totalWifiFloors: 4,
      },
      revenueChart: [
        { month: 'Mar', amount: 72000 },
        { month: 'Apr', amount: 78000 },
        { month: 'May', amount: 81000 },
        { month: 'Jun', amount: 84000 },
        { month: 'Jul', amount: 89000 },
        { month: 'Aug', amount: totalRevenue },
      ],
      occupancyChart: [
        { category: 'Single', occupied: rooms.filter(r => r.category === 'Single').reduce((s, r) => s + r.occupancy, 0), capacity: rooms.filter(r => r.category === 'Single').reduce((s, r) => s + r.capacity, 0) },
        { category: 'Double', occupied: rooms.filter(r => r.category === 'Double').reduce((s, r) => s + r.occupancy, 0), capacity: rooms.filter(r => r.category === 'Double').reduce((s, r) => s + r.capacity, 0) },
        { category: 'Triple', occupied: rooms.filter(r => r.category === 'Triple').reduce((s, r) => s + r.occupancy, 0), capacity: rooms.filter(r => r.category === 'Triple').reduce((s, r) => s + r.capacity, 0) },
        { category: 'Deluxe', occupied: rooms.filter(r => r.category === 'Deluxe').reduce((s, r) => s + r.occupancy, 0), capacity: rooms.filter(r => r.category === 'Deluxe').reduce((s, r) => s + r.capacity, 0) },
      ],
      paymentStatusPie: [
        { name: 'Paid Invoices', value: paidInvoicesCount || 2 },
        { name: 'Pending Rent', value: pendingInvoicesCount || 1 },
        { name: 'Overdue Dues', value: overdueInvoicesCount || 0 },
      ],
      recentTransactions: recentTransactions,
      totalRooms,
      occupiedRooms: rooms.filter((r) => r.occupancy > 0).length,
      availableRooms: rooms.filter((r) => r.status === 'Available').length,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      totalResidents: residents.length,
      pendingInvoicesCount: pendingInvoices.length,
      overdueAmount,
      openMaintenanceTickets,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Rooms API
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const data = req.body;
    const newRoom = await Room.create({
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
    });
    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ id: req.params.id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Residents API
app.get('/api/residents', async (req, res) => {
  try {
    const residents = await Resident.find().sort({ createdAt: -1 });
    res.json(residents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/residents', async (req, res) => {
  try {
    const data = req.body;
    const residentId = `res-${Date.now()}`;
    const newRes = new Resident({
      id: residentId,
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
    });

    if (data.roomId) {
      const room = await Room.findOne({ id: data.roomId });
      if (room) {
        newRes.roomNumber = room.roomNumber;
        room.occupancy = Math.min(room.capacity, room.occupancy + 1);
        if (room.occupancy >= room.capacity) room.status = 'Fully Occupied';
        room.residents.push({ id: residentId, name: newRes.name, bedNumber: newRes.bedNumber });
        await room.save();
      }
    }

    await newRes.save();
    res.status(201).json(newRes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/residents/:id', async (req, res) => {
  try {
    const oldResident = await Resident.findOne({ id: req.params.id });
    if (!oldResident) return res.status(404).json({ message: 'Resident not found' });

    const data = req.body;
    const oldRoomId = oldResident.roomId;

    const resident = await Resident.findOneAndUpdate({ id: req.params.id }, data, { new: true });
    if (!resident) return res.status(404).json({ message: 'Resident not found' });

    // Handle room re-allocation
    if (data.roomId && data.roomId !== oldRoomId) {
      // Remove from old room
      if (oldRoomId) {
        const oldRoom = await Room.findOne({ id: oldRoomId });
        if (oldRoom) {
          oldRoom.residents = oldRoom.residents.filter(r => r.id !== resident.id) as any;
          oldRoom.occupancy = Math.max(0, oldRoom.occupancy - 1);
          oldRoom.status = 'Available';
          await oldRoom.save();
        }
      }

      // Add to new room
      const newRoom = await Room.findOne({ id: data.roomId });
      if (newRoom) {
        resident.roomNumber = newRoom.roomNumber;
        newRoom.occupancy = Math.min(newRoom.capacity, newRoom.occupancy + 1);
        if (newRoom.occupancy >= newRoom.capacity) newRoom.status = 'Fully Occupied';
        newRoom.residents.push({ id: resident.id, name: resident.name, bedNumber: resident.bedNumber });
        await newRoom.save();
        await resident.save();
      }
    }

    res.json(resident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/residents/:id', async (req, res) => {
  try {
    const resident = await Resident.findOneAndDelete({ id: req.params.id });
    if (!resident) return res.status(404).json({ message: 'Resident not found' });

    // Deallocate room
    if (resident.roomId) {
      const room = await Room.findOne({ id: resident.roomId });
      if (room) {
        room.residents = room.residents.filter(r => r.id !== resident.id) as any;
        room.occupancy = Math.max(0, room.occupancy - 1);
        room.status = 'Available';
        await room.save();
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Staff API
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const data = req.body;
    const newStaff = await Staff.create({
      id: `staff-${Date.now()}`,
      name: data.name || 'Staff Member',
      email: data.email || 'staff@example.com',
      phone: data.phone || '9876543210',
      role: data.role || 'Cleaner',
      shift: data.shift || 'Full Time',
      salary: data.salary || 18000,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      status: data.status || 'ACTIVE',
    });
    res.status(201).json(newStaff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ id: req.params.id });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Invoices API
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/invoices/generate', async (req, res) => {
  try {
    const { month, year } = req.body;
    const monthName = month || 'August';
    const yearNum = year || 2026;

    const activeResidents = await Resident.find({ status: 'ACTIVE' });
    let count = 0;

    for (const res of activeResidents) {
      if (!res.roomId) continue;

      const exists = await Invoice.findOne({
        residentId: res.id,
        month: monthName,
        year: yearNum
      });

      if (!exists) {
        const room = await Room.findOne({ id: res.roomId });
        const rent = room ? room.monthlyRent : 8500;
        const electricityUnits = Math.floor(Math.random() * 30) + 20;
        const electricityCharges = electricityUnits * 10;
        const waterCharges = 200;
        const totalAmount = rent + electricityCharges + waterCharges;
        const dueDate = `${yearNum}-08-10`;

        await Invoice.create({
          id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          invoiceNumber: `INV-${yearNum}-${Math.floor(Math.random() * 8999 + 1000)}`,
          residentId: res.id,
          residentName: res.name,
          roomNumber: res.roomNumber || '101',
          month: monthName,
          year: yearNum,
          rentAmount: rent,
          electricityUnits,
          electricityCharges,
          waterCharges,
          fine: 0,
          totalAmount,
          dueDate,
          status: 'PENDING',
          createdAt: new Date().toISOString() as any
        });

        count++;

        // Trigger SMS notification if enabled
        const smsSet = await SmsSettings.findOne();
        if (smsSet && smsSet.enabled && smsSet.notifyOnInvoiceCreated && res.phone) {
          const smsText = buildPaymentDueSmsText(res.name, totalAmount, dueDate, res.roomNumber);
          const twilioResult = await sendSmsNotification({
            toPhone: res.phone,
            recipientName: res.name,
            message: smsText,
            type: 'PAYMENT_DUE',
            triggeredBy: 'Auto Billing Engine'
          });

          await SmsLog.create({
            id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            recipientName: res.name,
            phone: res.phone,
            type: 'PAYMENT_DUE',
            message: smsText,
            status: twilioResult.status,
            sentAt: new Date().toISOString(),
            sid: twilioResult.sid,
            triggeredBy: 'Auto Billing Engine'
          });
        }
      }
    }

    res.json({ success: true, message: `Successfully generated ${count} new invoice(s) for ${monthName} ${yearNum}.` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/invoices/recurring', async (req, res) => {
  try {
    const settings = await RecurringBillingSettings.findOne() || {
      enabled: true,
      scheduleDay: 1,
      autoSendSms: true,
      lastRunDate: '2026-08-01',
      nextRunDate: '2026-09-01',
    };
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/invoices/recurring', async (req, res) => {
  try {
    let settings = await RecurringBillingSettings.findOne();
    if (!settings) {
      settings = new RecurringBillingSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/invoices/send-reminder', async (req, res) => {
  try {
    const { invoiceId, triggeredBy } = req.body;
    const inv = await Invoice.findOne({ id: invoiceId });
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    const resident = await Resident.findOne({ id: inv.residentId });
    const phone = resident?.phone || '9876512345';

    const isOverdue = inv.status === 'OVERDUE' || (inv.status === 'PENDING' && new Date(inv.dueDate) < new Date());
    const prefix = isOverdue ? '🚨 URGENT OVERDUE PAYMENT REMINDER' : '📢 RENT PAYMENT REMINDER';
    const smsMessage = `Grand Horizon Hostel: ${prefix} for ${inv.residentName} (Room ${inv.roomNumber}). Rent amount of ₹${(inv.totalAmount || 0).toLocaleString('en-IN')} for ${inv.month} ${inv.year} is ${isOverdue ? 'OVERDUE' : 'due on ' + inv.dueDate}. Please clear your dues via PhonePe on resident portal or scan UPI QR code.`;

    const twilioResult = await sendSmsNotification({
      toPhone: phone,
      recipientName: inv.residentName,
      message: smsMessage,
      type: 'PAYMENT_DUE',
      triggeredBy: triggeredBy || 'Admin Manual Reminder'
    });

    const newLog = await SmsLog.create({
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientName: inv.residentName,
      phone,
      type: 'PAYMENT_DUE',
      message: smsMessage,
      status: twilioResult.status,
      sentAt: new Date().toISOString(),
      sid: twilioResult.sid,
      triggeredBy: triggeredBy || 'Admin Manual Reminder'
    });

    res.json({ ...twilioResult, log: newLog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Maintenance Requests API
app.get('/api/maintenance', async (req, res) => {
  try {
    const tickets = await MaintenanceRequest.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const data = req.body;
    const newTicket = await MaintenanceRequest.create({
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
      createdAt: new Date().toISOString() as any,
    });
    res.status(201).json(newTicket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const oldTicket = await MaintenanceRequest.findOne({ id: req.params.id });
    if (!oldTicket) return res.status(404).json({ message: 'Ticket not found' });

    const data = req.body;
    const ticket = await MaintenanceRequest.findOneAndUpdate({ id: req.params.id }, data, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // SMS Notifications logic
    const smsSet = await SmsSettings.findOne();
    if (smsSet && smsSet.enabled && smsSet.notifyOnMaintenanceUpdate && data.status && data.status !== oldTicket.status) {
      const resData = await Resident.findOne({ id: oldTicket.residentId });
      const phone = resData?.phone || '9876512345';
      const smsText = buildMaintenanceUpdateSmsText(
        oldTicket.residentName,
        oldTicket.title,
        data.status,
        oldTicket.roomNumber
      );

      const smsRes = await sendSmsNotification({
        toPhone: phone,
        recipientName: oldTicket.residentName,
        message: smsText,
        type: 'MAINTENANCE_UPDATE',
        triggeredBy: 'Maintenance Desk'
      });

      await SmsLog.create({
        id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        recipientName: oldTicket.residentName,
        phone,
        type: 'MAINTENANCE_UPDATE',
        message: smsText,
        status: smsRes.status,
        sentAt: new Date().toISOString(),
        sid: smsRes.sid,
        triggeredBy: 'Maintenance Desk'
      });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reports API
app.get('/api/reports', async (req, res) => {
  try {
    const type = req.query.type || 'revenue';

    if (type === 'revenue') {
      const invoices = await Invoice.find();
      const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0);
      const pendingDues = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.totalAmount, 0);

      res.json({
        summary: {
          totalCollected,
          pendingDues,
          activeInvoices: invoices.length,
        },
        rows: invoices.map((i) => ({
          InvoiceNo: i.invoiceNumber,
          Resident: i.residentName,
          Room: i.roomNumber,
          Month: `${i.month} ${i.year}`,
          TotalAmount: i.totalAmount,
          Status: i.status,
          DueDate: i.dueDate,
        })),
      });
    } else if (type === 'occupancy') {
      const rooms = await Room.find();
      res.json({
        summary: {
          totalRooms: rooms.length,
          occupiedRooms: rooms.filter((r) => r.occupancy > 0).length,
          availableRooms: rooms.filter((r) => r.status === 'Available').length,
        },
        rows: rooms.map((r) => ({
          RoomNumber: r.roomNumber,
          Floor: r.floor,
          Category: r.category,
          Capacity: r.capacity,
          Occupancy: r.occupancy,
          RentTariff: r.monthlyRent,
          Status: r.status,
        })),
      });
    } else if (type === 'residents') {
      const residents = await Resident.find();
      res.json({
        summary: {
          totalRegistered: residents.length,
          verifiedKYC: residents.filter((r) => r.documents?.status === 'VERIFIED').length,
        },
        rows: residents.map((r) => ({
          Name: r.name,
          Email: r.email,
          Phone: r.phone,
          RoomNumber: r.roomNumber || 'N/A',
          BedNumber: r.bedNumber || 'N/A',
          JoinDate: r.joinDate,
          Status: r.status,
        })),
      });
    } else {
      const maintenance = await MaintenanceRequest.find();
      res.json({
        summary: {
          totalTickets: maintenance.length,
          openTickets: maintenance.filter((m) => m.status !== 'RESOLVED').length,
          resolvedTickets: maintenance.filter((m) => m.status === 'RESOLVED').length,
        },
        rows: maintenance.map((m) => ({
          TicketID: m.id,
          Title: m.title,
          Category: m.category,
          Resident: m.residentName,
          Room: m.roomNumber,
          Priority: m.priority,
          Status: m.status,
          AssignedTo: m.assignedStaffName || 'Unassigned',
        })),
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PhonePe Payment Gateway Simulation
app.post('/api/payments/phonepe/callback', async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const inv = await Invoice.findOne({ id: invoiceId });

    if (inv) {
      inv.status = 'PAID';
      inv.paymentDate = new Date().toISOString();
      inv.paymentMethod = 'PhonePe UPI';
      inv.transactionId = `TXN-${Date.now()}`;
      await inv.save();

      // Trigger SMS notification
      const resident = await Resident.findOne({ id: inv.residentId });
      const smsSet = await SmsSettings.findOne();
      if (smsSet && smsSet.enabled && smsSet.notifyOnPaymentReceived && resident?.phone) {
        const smsText = `Grand Horizon Hostel: Payment confirmed! Received ₹${inv.totalAmount.toLocaleString('en-IN')} for Invoice ${inv.invoiceNumber} (${inv.month} ${inv.year}). Thank you!`;
        const twilioRes = await sendSmsNotification({
          toPhone: resident.phone,
          recipientName: resident.name,
          message: smsText,
          type: 'PAYMENT_DUE',
          triggeredBy: 'PhonePe Gateway'
        });

        await SmsLog.create({
          id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          recipientName: resident.name,
          phone: resident.phone,
          type: 'PAYMENT_DUE',
          message: smsText,
          status: twilioRes.status,
          sentAt: new Date().toISOString(),
          sid: twilioRes.sid,
          triggeredBy: 'PhonePe Gateway'
        });
      }

      return res.json({ success: true, invoice: inv });
    }
    res.status(404).json({ message: 'Invoice not found' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Payment Settings API
app.get('/api/payments/settings', async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne() || {
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
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payments/settings', async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Hostel Info API
app.get('/api/hostel/info', async (req, res) => {
  try {
    const info = await HostelInfo.findOne() || {
      name: 'Grand Horizon',
      tagline: 'Premium Student & Professional Co-Living Hostel',
      address: 'Plot 42, Innovation Corridor, Cyber City, Hyderabad, 500081',
      phone: '+91 98765 43210',
      email: 'support@grandhorizonhostel.com',
      establishedYear: '2021',
      gstin: '36AAAAA0000A1Z5',
    };
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hostel/info', async (req, res) => {
  try {
    let info = await HostelInfo.findOne();
    if (!info) {
      info = new HostelInfo(req.body);
    } else {
      Object.assign(info, req.body);
    }
    await info.save();
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Floor Wi-Fi API
app.get('/api/wifi/floors', async (req, res) => {
  try {
    const list = await FloorWifi.find();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/wifi/floors', async (req, res) => {
  try {
    const data = req.body;
    let wifi = await FloorWifi.findOne({ floor: data.floor });
    if (!wifi) {
      wifi = new FloorWifi(data);
    } else {
      Object.assign(wifi, data);
    }
    await wifi.save();
    res.json(wifi);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/wifi/floors/:floorNum', async (req, res) => {
  try {
    const floor = Number(req.params.floorNum);
    const wifi = await FloorWifi.findOne({ floor }) || {
      floor,
      ssid: floor === 1 ? 'GrandHorizon_Resident' : `GrandHorizon_Fl${floor}_5G`,
      password: 'Fiber1Gbps#2026',
      speed: '1 Gbps Fiber',
      frequency: '5 GHz Dual-Band',
      notes: `Floor ${floor} High-Speed Mesh Access Point`,
    };
    res.json(wifi);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/wifi/floors/:floorNum', async (req, res) => {
  try {
    const floor = Number(req.params.floorNum);
    const wifi = await FloorWifi.findOneAndUpdate({ floor }, req.body, { new: true, upsert: true });
    res.json(wifi);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/wifi/floors/:floorNum', async (req, res) => {
  try {
    const floor = Number(req.params.floorNum);
    await FloorWifi.findOneAndDelete({ floor });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// SMS API Endpoints
app.get('/api/sms/logs', async (req, res) => {
  try {
    const logs = await SmsLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sms/templates', async (req, res) => {
  try {
    const templates = await SmsTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sms/templates', async (req, res) => {
  try {
    const data = req.body;
    const newTmpl = await SmsTemplate.create({
      ...data,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSystem: false,
    });
    res.json(newTmpl);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/sms/templates/:id', async (req, res) => {
  try {
    const tmpl = await SmsTemplate.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!tmpl) return res.status(404).json({ message: 'Template not found' });
    res.json(tmpl);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/sms/templates/:id', async (req, res) => {
  try {
    const tmpl = await SmsTemplate.findOneAndDelete({ id: req.params.id });
    if (!tmpl) return res.status(404).json({ message: 'Template not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sms/settings', async (req, res) => {
  try {
    const settings = await SmsSettings.findOne() || {
      enabled: true,
      notifyOnInvoiceCreated: true,
      notifyOnPaymentOverdue: true,
      notifyOnMaintenanceUpdate: true,
      notifyOnPaymentReceived: true,
      emergencyBroadcastsEnabled: true,
      twilioConfigured: checkTwilioConfiguration().configured
    };
    res.json({
      ...settings,
      twilioConfigured: checkTwilioConfiguration().configured
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/sms/settings', async (req, res) => {
  try {
    let settings = await SmsSettings.findOne();
    if (!settings) {
      settings = new SmsSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sms/send', async (req, res) => {
  try {
    const bodyData = req.body;
    const recipientName = bodyData.recipientName || 'Resident';
    const phone = bodyData.phone || '9876543210';
    const message = bodyData.message || 'SMS Alert';
    const type = bodyData.type || 'CUSTOM';
    const triggeredBy = bodyData.triggeredBy || 'Admin Action';

    const result = await sendSmsNotification({
      toPhone: phone,
      recipientName,
      message,
      type,
      triggeredBy
    });

    const newLog = await SmsLog.create({
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientName,
      phone,
      type,
      message,
      status: result.status,
      sentAt: new Date().toISOString(),
      sid: result.sid,
      triggeredBy
    });

    res.json({ ...result, log: newLog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sms/broadcast', async (req, res) => {
  try {
    const bodyData = req.body;
    const headline = bodyData.headline || 'URGENT NOTICE';
    const messageBody = bodyData.message || 'Important hostel announcement.';
    const triggeredBy = bodyData.triggeredBy || 'Admin Broadcast';

    const activeResidents = await Resident.find({ status: 'ACTIVE' });
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
    const broadcastLog = await SmsLog.create({
      id: `sms-bcast-${Date.now()}`,
      recipientName: `All Active Residents (${activeResidents.length})`,
      phone: 'BROADCAST_GROUP',
      type: 'EMERGENCY_BROADCAST',
      message: fullSmsText,
      status: checkTwilioConfiguration().configured ? 'DELIVERED' : 'SIMULATED',
      sentAt: new Date().toISOString(),
      sid: sids[0] || `SM_BCAST_${Date.now()}`,
      triggeredBy,
    });

    // Add to internal system notifications
    await Notification.create({
      id: `notif-${Date.now()}`,
      title: `🚨 ${headline}`,
      message: messageBody,
      createdAt: new Date().toISOString() as any,
      target: 'ALL',
    });

    res.json({
      success: true,
      recipientCount: activeResidents.length,
      deliveredCount,
      message: `Emergency SMS Broadcast dispatched to ${activeResidents.length} resident(s).`,
      log: broadcastLog,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Serve static assets in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log(`Serving static assets from: ${distPath}`);
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`Static assets directory not found at: ${distPath}. Running in API-only mode.`);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
