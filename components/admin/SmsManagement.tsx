import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Shield,
  Smartphone,
  Settings,
  BellRing,
  Info,
  Clock,
  Zap,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  FileText,
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  IndianRupee,
  SendHorizontal,
} from 'lucide-react';
import { SmsLog, SmsSettings, Resident, SmsTemplate, Invoice } from '../../lib/types';
import { hostelStore } from '../../lib/store';

export default function SmsManagement() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [settings, setSettings] = useState<SmsSettings | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'broadcast' | 'reminders' | 'direct' | 'templates' | 'logs' | 'settings'>('reminders');

  // Automated Rent Reminders State
  const [batchReminding, setBatchReminding] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  const [remindedInvoices, setRemindedInvoices] = useState<Record<string, boolean>>({});
  const [autoScheduleReminders, setAutoScheduleReminders] = useState(true);

  // Emergency Broadcast Form State
  const [bcastHeadline, setBcastHeadline] = useState('');
  const [bcastBody, setBcastBody] = useState('');
  const [bcastSending, setBcastSending] = useState(false);
  const [bcastSuccess, setBcastSuccess] = useState<string | null>(null);

  // Direct SMS Form State
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'PAYMENT_DUE' | 'OVERDUE' | 'MAINTENANCE' | 'WELCOME' | 'CUSTOM'>('PAYMENT_DUE');
  const [directMessage, setDirectMessage] = useState('');
  const [directSending, setDirectSending] = useState(false);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  // Templates Library Search & Filter State
  const [tmplSearch, setTmplSearch] = useState('');
  const [tmplCategory, setTmplCategory] = useState<string>('ALL');

  // Create / Edit Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTmplId, setEditingTmplId] = useState<string | null>(null);
  const [tmplTitle, setTmplTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'BROADCAST' | 'PAYMENT_DUE' | 'OVERDUE' | 'MAINTENANCE' | 'WELCOME' | 'GENERAL'>('GENERAL');
  const [formHeadline, setFormHeadline] = useState('');
  const [formBody, setFormBody] = useState('');
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  // Log Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const logsRes = hostelStore.getSmsLogs();
      const settingsRes = hostelStore.getSmsSettings();
      const residentsRes = hostelStore.getResidents();
      const templatesRes = hostelStore.getSmsTemplates();
      const invoicesRes = hostelStore.getInvoices();
      setLogs(logsRes);
      setSettings(settingsRes);
      setResidents(residentsRes);
      setTemplates(templatesRes);
      setInvoices(invoicesRes);

      if (residentsRes.length > 0 && !selectedResidentId) {
        setSelectedResidentId(residentsRes[0].id);
        setCustomName(residentsRes[0].name);
        setCustomPhone(residentsRes[0].phone);
        updateTemplateText('PAYMENT_DUE', residentsRes[0]);
      }
    } catch (err) {
      console.error('Failed to load SMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPendingOrDueInvoices = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices.filter((inv) => {
      if (inv.status === 'PAID') return false;

      if (!inv.dueDate) return true;
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return inv.status === 'OVERDUE' || inv.status === 'PENDING' || diffDays <= 3;
    });
  };

  const getPreconfiguredSmsText = (inv: Invoice) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = inv.dueDate ? new Date(inv.dueDate) : new Date();
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let statusText = `due on ${inv.dueDate || '10th'}`;
    if (inv.status === 'OVERDUE' || diffDays < 0) {
      statusText = `OVERDUE by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      statusText = `DUE TODAY (${inv.dueDate})`;
    } else if (diffDays <= 3) {
      statusText = `due in ${diffDays} day(s) on ${inv.dueDate}`;
    }

    return `Grand Horizon Hostel: Dear ${inv.residentName}, your rent payment of ₹${inv.totalAmount.toLocaleString('en-IN')} for Room ${inv.roomNumber || '101'} (${inv.month} ${inv.year}) is ${statusText}. Please clear your dues on your resident portal.`;
  };

  const handleSendAllAutomatedReminders = async () => {
    const pendingInvoices = getPendingOrDueInvoices();
    if (pendingInvoices.length === 0) return;
    setBatchReminding(true);
    setBatchSuccess(null);
    let count = 0;

    for (const inv of pendingInvoices) {
      const resident = residents.find((r) => r.id === inv.residentId || r.name === inv.residentName);
      const phone = resident?.phone || '9876512345';
      const message = getPreconfiguredSmsText(inv);
      await hostelStore.sendCustomSms(
        inv.residentName,
        phone,
        message,
        'PAYMENT_DUE',
        'Automated Rent Reminder Service'
      );
      setRemindedInvoices((prev) => ({ ...prev, [inv.id]: true }));
      count++;
    }

    setBatchSuccess(`Automated rent reminder SMS dispatched successfully to ${count} resident(s)!`);
    setBatchReminding(false);
    fetchData();
  };

  const handleSendSingleAutomatedReminder = async (inv: Invoice) => {
    const resident = residents.find((r) => r.id === inv.residentId || r.name === inv.residentName);
    const phone = resident?.phone || '9876512345';
    const message = getPreconfiguredSmsText(inv);
    await hostelStore.sendCustomSms(
      inv.residentName,
      phone,
      message,
      'PAYMENT_DUE',
      'Automated Rent Reminder Service'
    );
    setRemindedInvoices((prev) => ({ ...prev, [inv.id]: true }));
    fetchData();
  };

  const handleResidentChange = (resId: string) => {
    setSelectedResidentId(resId);
    const found = residents.find((r) => r.id === resId);
    if (found) {
      setCustomName(found.name);
      setCustomPhone(found.phone);
      updateTemplateText(selectedTemplate, found);
    }
  };

  const updateTemplateText = (
    template: 'PAYMENT_DUE' | 'OVERDUE' | 'MAINTENANCE' | 'WELCOME' | 'CUSTOM',
    res?: Resident
  ) => {
    setSelectedTemplate(template);
    const target = res || residents.find((r) => r.id === selectedResidentId) || {
      name: customName || 'Resident',
      roomNumber: '101',
      phone: customPhone,
    };

    switch (template) {
      case 'PAYMENT_DUE':
        setDirectMessage(
          `Grand Horizon Hostel: Dear ${target.name}, your rent invoice of ₹8,500 (Room ${target.roomNumber || '101'}) is due on 10th August. Pay via PhonePe on your resident portal.`
        );
        break;
      case 'OVERDUE':
        setDirectMessage(
          `URGENT - Grand Horizon Hostel: Dear ${target.name}, your rent payment is OVERDUE. Please clear it immediately on your portal to avoid penalties.`
        );
        break;
      case 'MAINTENANCE':
        setDirectMessage(
          `Grand Horizon Hostel Alert: Dear ${target.name}, your maintenance request for Room ${target.roomNumber || '101'} has been updated to "RESOLVED". Thank you.`
        );
        break;
      case 'WELCOME':
        setDirectMessage(
          `Welcome to Grand Horizon Hostel! Dear ${target.name}, your room ${target.roomNumber || '101'} is allocated. Access your resident portal for invoices & maintenance.`
        );
        break;
      case 'CUSTOM':
        setDirectMessage('');
        break;
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcastHeadline || !bcastBody) return;
    setBcastSending(true);
    setBcastSuccess(null);
    try {
      const res = await hostelStore.broadcastSmsToAll(bcastHeadline, bcastBody, 'Admin Broadcast Dispatch');
      setBcastSuccess(`Broadcast sent! Delivered to ${res.recipientCount} active resident(s).`);
      setBcastHeadline('');
      setBcastBody('');
      fetchData();
    } catch (err: any) {
      alert('Broadcast failed: ' + err.message);
    } finally {
      setBcastSending(false);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhone || !directMessage) return;
    setDirectSending(true);
    setDirectSuccess(null);
    try {
      const res = await hostelStore.sendCustomSms(
        customName || 'Resident',
        customPhone,
        directMessage,
        selectedTemplate === 'OVERDUE' ? 'PAYMENT_DUE' : selectedTemplate === 'WELCOME' ? 'WELCOME' : selectedTemplate === 'MAINTENANCE' ? 'MAINTENANCE_UPDATE' : 'CUSTOM',
        'Admin Direct Dispatch'
      );
      setDirectSuccess(`SMS dispatched successfully to ${customPhone} (${res.status}).`);
      fetchData();
    } catch (err: any) {
      alert('SMS dispatch failed: ' + err.message);
    } finally {
      setDirectSending(false);
    }
  };

  // TEMPLATES LIBRARY HANDLERS
  const handleSelectTemplateForBroadcast = (tmpl: SmsTemplate) => {
    setBcastHeadline(tmpl.headline || tmpl.title);
    setBcastBody(tmpl.body);
    setActiveTab('broadcast');
  };

  const handleSelectTemplateForDirect = (tmpl: SmsTemplate) => {
    const target = residents.find((r) => r.id === selectedResidentId) || {
      name: customName || 'Resident',
      roomNumber: '101',
      phone: customPhone,
    };
    let formatted = tmpl.body
      .replace(/\{ResidentName\}/g, target.name)
      .replace(/\{RoomNo\}/g, target.roomNumber || '101')
      .replace(/\{Amount\}/g, '8,500');
    setDirectMessage(formatted);
    setActiveTab('direct');
  };

  const handleOpenCreateTemplate = () => {
    setEditingTmplId(null);
    setTmplTitle('');
    setFormCategory('GENERAL');
    setFormHeadline('');
    setFormBody('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: SmsTemplate) => {
    setEditingTmplId(tmpl.id);
    setTmplTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormHeadline(tmpl.headline || '');
    setFormBody(tmpl.body);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplTitle || !formBody) return;

    if (editingTmplId) {
      hostelStore.updateSmsTemplate(editingTmplId, {
        title: tmplTitle,
        category: formCategory,
        headline: formHeadline,
        body: formBody,
      });
    } else {
      hostelStore.addSmsTemplate({
        title: tmplTitle,
        category: formCategory,
        headline: formHeadline,
        body: formBody,
      });
    }
    setIsTemplateModalOpen(false);
    fetchData();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this SMS template from library?')) {
      hostelStore.deleteSmsTemplate(id);
      fetchData();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessId(id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  const handleToggleSetting = async (key: keyof SmsSettings) => {
    if (!settings) return;
    const updated = { [key]: !settings[key] };
    const res = hostelStore.updateSmsSettings(updated);
    setSettings({ ...settings, ...res });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Twilio Gateway Integration Status */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> SMS Service Center (Twilio API)
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 border ${
                  settings?.twilioConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {settings?.twilioConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Twilio Live Credentials Active
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" /> Simulated Sandbox Mode Active
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Hostel SMS Notification System</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Automated Twilio SMS alerts for rent due dates, PhonePe payment confirmations, maintenance updates, and emergency broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {!settings?.twilioConfigured && (
          <div className="mt-4 p-3 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Developers Note: </span>
              To send real cell tower SMS messages, configure <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">TWILIO_ACCOUNT_SID</code>, <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">TWILIO_AUTH_TOKEN</code>, and <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">TWILIO_PHONE_NUMBER</code> in your secrets or <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">.env</code>. The app currently logs and simulates SMS delivery seamlessly.
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'reminders'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" /> ⏰ Automated Rent Reminders
          {getPendingOrDueInvoices().length > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse">
              {getPendingOrDueInvoices().length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" /> 🚨 Emergency Broadcast
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'direct'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Send className="w-4 h-4" /> 💬 Direct SMS Dispatcher
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'templates'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 📋 Templates Library ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> 📜 Sent SMS Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-extrabold rounded-2xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" /> ⚙️ Trigger Settings
        </button>
      </div>

      {/* Tab: Automated Rent Reminders */}
      {activeTab === 'reminders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Automated Service
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Target: Pending / Due within 3 Days
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" /> Automated Rent Payment Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically identifies residents with pending or upcoming rent payments (due within 3 days or overdue) and dispatches pre-configured SMS reminders.
              </p>
            </div>

            <button
              onClick={handleSendAllAutomatedReminders}
              disabled={batchReminding || getPendingOrDueInvoices().length === 0}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              <SendHorizontal className={`w-4 h-4 ${batchReminding ? 'animate-spin' : ''}`} />
              {batchReminding
                ? 'Dispatching All Reminders...'
                : `Batch Send Automated SMS (${getPendingOrDueInvoices().length})`}
            </button>
          </div>

          {batchSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{batchSuccess}</span>
            </div>
          )}

          {/* Automated Rule Schedule Settings Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Automated Reminder Rule
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sends a pre-configured SMS reminder to residents 3 days before their rent due date and on the due date.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {autoScheduleReminders ? 'Auto-Trigger Active' : 'Auto-Trigger Paused'}
              </span>
              <button
                onClick={() => setAutoScheduleReminders(!autoScheduleReminders)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  autoScheduleReminders ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    autoScheduleReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* List of Pending / Due Residents requiring SMS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Qualifying Residents ({getPendingOrDueInvoices().length})
            </h4>

            {getPendingOrDueInvoices().length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Clear! No Rent Dues Pending</h4>
                <p className="text-xs text-slate-500">All residents have paid their rent or no invoices are due within 3 days.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPendingOrDueInvoices().map((inv) => {
                  const resident = residents.find((r) => r.id === inv.residentId || r.name === inv.residentName);
                  const phone = resident?.phone || '9876512345';
                  const preconfiguredText = getPreconfiguredSmsText(inv);
                  const isReminded = remindedInvoices[inv.id];

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = inv.dueDate ? new Date(inv.dueDate) : new Date();
                  due.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={inv.id}
                      className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 relative hover:border-amber-500/50 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={resident?.profileImage || 'https://picsum.photos/seed/user/200/200'}
                            alt={inv.residentName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                              {inv.residentName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Room {inv.roomNumber || '101'} • +91 {phone}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-xl border ${
                            inv.status === 'OVERDUE' || diffDays < 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                              : diffDays === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                          }`}
                        >
                          {diffDays < 0
                            ? `OVERDUE (${Math.abs(diffDays)}d)`
                            : diffDays === 0
                            ? 'DUE TODAY'
                            : `DUE IN ${diffDays} DAY(S)`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Rent Amount</span>
                          <span className="font-black text-slate-900 dark:text-white flex items-center gap-0.5">
                            <IndianRupee className="w-3 h-3 text-emerald-600" />
                            {inv.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Due Date</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {inv.dueDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Invoice #</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            {inv.invoiceNumber || inv.id}
                          </span>
                        </div>
                      </div>

                      {/* Preconfigured SMS Message Box */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600" /> Pre-configured SMS Content
                          </span>
                          <button
                            onClick={() => handleCopyText(preconfiguredText, inv.id)}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {copySuccessId === inv.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copySuccessId === inv.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                          {preconfiguredText}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        {isReminded ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Reminder SMS Dispatched!
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Ready to dispatch via Twilio Gateway
                          </span>
                        )}

                        <button
                          onClick={() => handleSendSingleAutomatedReminder(inv)}
                          disabled={isReminded}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm ${
                            isReminded
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          <SendHorizontal className="w-3.5 h-3.5" />
                          {isReminded ? 'Sent' : 'Send Reminder SMS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Emergency Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600" /> Send Emergency SMS Broadcast
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly dispatches an emergency SMS alert to all active hostel residents ({residents.filter((r) => r.status === 'ACTIVE').length} active numbers).
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900">
              ⚡ High Priority Alert
            </span>
          </div>

          {/* Quick Load from Templates Library */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Quick Load from Templates Library:
              </span>
            </div>
            <select
              onChange={(e) => {
                const found = templates.find((t) => t.id === e.target.value);
                if (found) handleSelectTemplateForBroadcast(found);
              }}
              defaultValue=""
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none w-full sm:w-auto"
            >
              <option value="" disabled>
                -- Select a Saved Template --
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {bcastSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bcastSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Topic / Headline *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {[
                  'WATER SUPPLY SHUTDOWN',
                  'FIRE DRILL ANNOUNCEMENT',
                  'POWER MAINTENANCE',
                  'URGENT FEE DEADLINE',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBcastHeadline(preset)}
                    className={`py-1.5 px-3 text-[11px] font-bold rounded-xl border transition ${
                      bcastHeadline === preset
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={bcastHeadline}
                onChange={(e) => setBcastHeadline(e.target.value)}
                placeholder="e.g. WATER TANK CLEANING SUNDAY"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Broadcast Message Body *
              </label>
              <textarea
                rows={3}
                required
                value={bcastBody}
                onChange={(e) => setBcastBody(e.target.value)}
                placeholder="e.g. Water supply will be paused from 9 AM to 12 PM this Sunday for tank sanitization. Please store water in advance."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Live Message Preview */}
            {bcastHeadline && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  📱 SMS Message Preview ({bcastHeadline.length + bcastBody.length + 80} chars)
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-mono">
                  🚨 EMERGENCY HOSTEL BROADCAST [Grand Horizon]: {bcastHeadline.toUpperCase()} - {bcastBody || '...'}. Contact Warden for support (+91 98765 00001).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={bcastSending || !bcastHeadline || !bcastBody}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-2"
            >
              <Radio className={`w-4 h-4 ${bcastSending ? 'animate-spin' : ''}`} />
              {bcastSending ? 'Dispatching Broadcast SMS...' : 'Dispatch Emergency Broadcast SMS'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Direct SMS Dispatcher */}
      {activeTab === 'direct' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" /> Direct Resident SMS Dispatcher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send a target SMS alert to a specific resident using pre-designed templates or custom text.
              </p>
            </div>
          </div>

          {directSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{directSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendDirect} className="space-y-4">
            {/* Quick Load from Templates Library */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Quick Load from Templates Library:
                </span>
              </div>
              <select
                onChange={(e) => {
                  const found = templates.find((t) => t.id === e.target.value);
                  if (found) handleSelectTemplateForDirect(found);
                }}
                defaultValue=""
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none w-full sm:w-auto"
              >
                <option value="" disabled>
                  -- Select a Saved Template --
                </option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category}] {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Resident *
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => handleResidentChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Room {r.roomNumber || 'N/A'}) - {r.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Phone Number
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMS Template Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'PAYMENT_DUE', label: '💳 Rent Due' },
                  { id: 'OVERDUE', label: '⚠️ Overdue' },
                  { id: 'MAINTENANCE', label: '🛠️ Maintenance' },
                  { id: 'WELCOME', label: '👋 Welcome' },
                  { id: 'CUSTOM', label: '✍️ Custom' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => updateTemplateText(tmpl.id as any)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      selectedTemplate === tmpl.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMS Message Text *
              </label>
              <textarea
                rows={3}
                required
                value={directMessage}
                onChange={(e) => setDirectMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={directSending || !customPhone || !directMessage}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-2"
            >
              <Send className={`w-4 h-4 ${directSending ? 'animate-spin' : ''}`} />
              {directSending ? 'Sending SMS...' : 'Send Direct SMS Alert'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: SMS Templates Library */}
      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" /> SMS Message Templates Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save, customize, and quickly trigger standardized SMS messages for mass emergency broadcasting or direct resident notifications.
              </p>
            </div>

            <button
              onClick={handleOpenCreateTemplate}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Template
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tmplSearch}
                onChange={(e) => setTmplSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {['ALL', 'BROADCAST', 'PAYMENT_DUE', 'OVERDUE', 'MAINTENANCE', 'WELCOME', 'GENERAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTmplCategory(cat)}
                  className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition shrink-0 ${
                    tmplCategory === cat
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates
              .filter((t) => {
                const matchesCat = tmplCategory === 'ALL' || t.category === tmplCategory;
                const matchesSearch =
                  t.title.toLowerCase().includes(tmplSearch.toLowerCase()) ||
                  t.body.toLowerCase().includes(tmplSearch.toLowerCase()) ||
                  (t.headline && t.headline.toLowerCase().includes(tmplSearch.toLowerCase()));
                return matchesCat && matchesSearch;
              })
              .map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 hover:shadow-md transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                          tmpl.category === 'BROADCAST'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : tmpl.category === 'PAYMENT_DUE' || tmpl.category === 'OVERDUE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : tmpl.category === 'MAINTENANCE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tmpl.category.replace('_', ' ')}
                      </span>

                      {tmpl.isSystem ? (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> System Default
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Custom Admin
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {tmpl.title}
                    </h4>

                    {tmpl.headline && (
                      <div className="p-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] font-bold rounded-lg border border-rose-200 dark:border-rose-900/40">
                        🚨 {tmpl.headline}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                      {tmpl.body}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {tmpl.category === 'BROADCAST' ? (
                        <button
                          onClick={() => handleSelectTemplateForBroadcast(tmpl)}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold rounded-xl transition flex items-center gap-1 shadow-sm"
                          title="Use in Mass Emergency Broadcast"
                        >
                          <Radio className="w-3 h-3" /> Mass Broadcast
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectTemplateForDirect(tmpl)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold rounded-xl transition flex items-center gap-1 shadow-sm"
                          title="Use in Direct SMS Dispatcher"
                        >
                          <Send className="w-3 h-3" /> Direct SMS
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyText(tmpl.body, tmpl.id)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition"
                        title="Copy message text"
                      >
                        {copySuccessId === tmpl.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTemplate(tmpl)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-600 dark:text-slate-300 hover:text-amber-600 rounded-xl transition"
                        title="Edit Template"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!tmpl.isSystem && (
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-xl transition"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                {editingTmplId ? 'Edit SMS Template' : 'Create New SMS Template'}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={tmplTitle}
                  onChange={(e) => setTmplTitle(e.target.value)}
                  placeholder="e.g. Monthly Rent Reminder"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Tag *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="BROADCAST">🚨 Mass Emergency Broadcast</option>
                    <option value="PAYMENT_DUE">💳 Rent Payment Due</option>
                    <option value="OVERDUE">⚠️ Overdue Notice</option>
                    <option value="MAINTENANCE">🛠️ Maintenance Ticket</option>
                    <option value="WELCOME">👋 Welcome Alert</option>
                    <option value="GENERAL">📢 General Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Broadcast Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formHeadline}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    placeholder="e.g. WATER TANK CLEANING"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body Text * (Use {'{ResidentName}'}, {'{RoomNo}'}, {'{Amount}'})
                </label>
                <textarea
                  rows={4}
                  required
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="e.g. Grand Horizon Hostel: Dear {ResidentName}, your rent invoice for Room {RoomNo} is ready. Please pay via PhonePe."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Save Template to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Sent SMS Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" /> Sent SMS Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete historical record of all automated and manual SMS alerts dispatched by the system.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search log or phone..."
                  className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none font-bold"
              >
                <option value="ALL">All Types</option>
                <option value="PAYMENT_DUE">Payment Due</option>
                <option value="MAINTENANCE_UPDATE">Maintenance</option>
                <option value="EMERGENCY_BROADCAST">Emergency</option>
                <option value="WELCOME">Welcome</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Recipient & Phone</th>
                  <th className="px-4 py-3">SMS Type</th>
                  <th className="px-4 py-3">Message Snippet</th>
                  <th className="px-4 py-3">Status & SID</th>
                  <th className="px-4 py-3">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No SMS logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{log.recipientName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{log.phone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg ${
                            log.type === 'EMERGENCY_BROADCAST'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : log.type === 'PAYMENT_DUE'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : log.type === 'MAINTENANCE_UPDATE'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          }`}
                        >
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {log.message}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-lg ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {log.status === 'DELIVERED' ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{log.sid || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(log.sentAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                        <span className="block text-[10px] text-slate-400">{log.triggeredBy || 'System'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Trigger Settings */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" /> Automated SMS Trigger Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure automatic SMS dispatch preferences for hostel lifecycle events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'enabled',
                title: 'Global SMS Notifications Enabled',
                desc: 'Master switch to toggle all SMS notifications across the hostel portal.',
              },
              {
                key: 'notifyOnInvoiceCreated',
                title: 'New Monthly Rent Invoice Created',
                desc: 'Auto-send SMS to resident as soon as monthly rent invoice is generated.',
              },
              {
                key: 'notifyOnPaymentOverdue',
                title: 'Payment Overdue Alerts',
                desc: 'Auto-send urgent SMS warning when invoice passes due date.',
              },
              {
                key: 'notifyOnPaymentReceived',
                title: 'PhonePe Payment Receipt Confirmation',
                desc: 'Send instant SMS receipt confirmation upon successful PhonePe payment.',
              },
              {
                key: 'notifyOnMaintenanceUpdate',
                title: 'Maintenance Ticket Status Changes',
                desc: 'Notify residents via SMS when staff updates or resolves their maintenance request.',
              },
              {
                key: 'emergencyBroadcastsEnabled',
                title: 'Emergency Broadcast Authorization',
                desc: 'Allow Wardens and Admin staff to send mass emergency SMS broadcasts.',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggleSetting(item.key as keyof SmsSettings)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    (settings as any)[item.key] ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      (settings as any)[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
