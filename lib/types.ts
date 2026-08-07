export type Role = 'admin' | 'resident' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roomNumber?: string;
  roomId?: string;
  phone?: string;
}

export interface RoomResident {
  id: string;
  name: string;
  bedNumber?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  category: 'Single' | 'Double' | 'Triple' | 'Deluxe' | 'SINGLE_AC' | 'DELUXE_TWIN' | 'STANDARD_TRIPLE' | 'SUITE_FOUR' | string;
  capacity: number;
  occupancy: number;
  monthlyRent: number;
  amenities: string[];
  status: 'Available' | 'Fully Occupied' | 'Under Maintenance' | 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | string;
  floor: number;
  residents?: RoomResident[];
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber?: string;
  roomId?: string;
  bedNumber?: string;
  rentStatus?: 'PAID' | 'PENDING' | 'OVERDUE' | string;
  joinDate?: string;
  emergencyContact?: string;
  kycVerified?: boolean;
  monthFee?: number;
  depositAmount?: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  profileImage?: string;
  documents?: {
    idProof?: boolean;
    photo?: boolean;
    agreement?: boolean;
    aadhaarUrl?: string;
    panUrl?: string;
    status?: 'VERIFIED' | 'PENDING' | 'REJECTED' | string;
  };
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Warden' | 'Cleaner' | 'Security' | 'Chef' | 'Electrician' | 'Maintenance' | string;
  shift?: 'Morning' | 'Evening' | 'Night' | 'Full Time' | 'Day' | string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | string;
  assignedTicketsCount?: number;
  salary?: number;
  joinDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  residentId: string;
  residentName: string;
  roomNumber?: string;
  month: string;
  year: number;
  rentAmount: number;
  utilityAmount?: number;
  electricityUnits?: number;
  electricityCharges?: number;
  waterCharges?: number;
  fine?: number;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | string;
  dueDate: string;
  paidAt?: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: string;
}

export interface RecurringBillingSettings {
  enabled: boolean;
  scheduleDay: number; // 1st of every month
  autoSendSms: boolean;
  lastRunDate?: string;
  nextRunDate: string;
}

export interface MaintenanceRequest {
  id: string;
  residentId: string;
  residentName: string;
  roomId: string;
  roomNumber: string;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'Wi-Fi' | 'Furniture' | 'Cleaning' | string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
  createdAt: string;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetRole?: Role | 'ALL' | string;
  target?: string;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  recipientName: string;
  phone: string;
  type: 'PAYMENT_DUE' | 'MAINTENANCE_UPDATE' | 'EMERGENCY_BROADCAST' | 'WELCOME' | 'CUSTOM';
  message: string;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  sentAt: string;
  sid?: string;
  triggeredBy?: string;
}

export interface SmsSettings {
  enabled: boolean;
  notifyOnInvoiceCreated: boolean;
  notifyOnPaymentOverdue: boolean;
  notifyOnMaintenanceUpdate: boolean;
  notifyOnPaymentReceived: boolean;
  emergencyBroadcastsEnabled: boolean;
  twilioConfigured: boolean;
}

export interface SmsTemplate {
  id: string;
  title: string;
  category: 'BROADCAST' | 'PAYMENT_DUE' | 'OVERDUE' | 'MAINTENANCE' | 'WELCOME' | 'GENERAL';
  headline?: string;
  body: string;
  isSystem?: boolean;
  createdAt?: string;
}

export interface PaymentSettings {
  merchantName: string;
  merchantUpiVpa: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  phonePeQrEnabled: boolean;
  upiCollectEnabled: boolean;
  cashPaymentEnabled: boolean;
  rentDueDay: number;
  gracePeriodDays: number;
  lateFeePerDay: number;
  autoApplyLateFee: boolean;
  autoSendPaymentReceiptSms: boolean;
  includeQrInSmsReminder: boolean;
}

export interface OnboardingState {
  completed: boolean;
  completedAt?: string;
  currentStep: number;
  profileCompleted: boolean;
  tourFinished: boolean;
}

export interface FloorWifi {
  floor: number;
  ssid: string;
  password: string;
  speed?: string;
  frequency?: string;
  notes?: string;
}

export interface HostelInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  establishedYear?: string;
  gstin?: string;
}

