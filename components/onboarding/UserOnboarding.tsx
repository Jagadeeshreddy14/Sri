import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  UserCheck,
  ShieldCheck,
  Wrench,
  Home,
  CreditCard,
  Mic,
  MessageSquare,
  Building2,
  Phone,
  HelpCircle,
  Award,
  Bell,
  Star,
} from 'lucide-react';
import { User, Role } from '../../lib/types';
import { hostelStore } from '../../lib/store';

interface UserOnboardingProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function UserOnboarding({ user, isOpen, onClose, onComplete }: UserOnboardingProps) {
  const role: Role = user?.role || 'resident';

  // Form State for Profile Completion Step
  const [step, setStep] = useState(1); // 1: Welcome, 2: Profile Completion, 3: Core Features Tour, 4: All Set / Ready
  const [tourIndex, setTourIndex] = useState(0);

  const [phone, setPhone] = useState(user?.phone || '+91 98765 12345');
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 00001');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  // Role Specific Tour Steps
  const getRoleTourSteps = () => {
    if (role === 'admin') {
      return [
        {
          title: '🏢 Room Management & Occupancy',
          icon: <Building2 className="w-8 h-8 text-blue-600" />,
          desc: 'Monitor real-time room capacity, floor allocations, and available beds across Single, Double, Triple, and Deluxe suites.',
          tip: 'Tip: Use the Room Management tab to assign beds or set maintenance blocks.',
        },
        {
          title: '💳 Smart Billing & PhonePe Payments',
          icon: <CreditCard className="w-8 h-8 text-emerald-600" />,
          desc: 'Batch generate monthly rent invoices with automated electricity unit charges and track instant PhonePe UPI settlements.',
          tip: 'Tip: Resident payment statuses update automatically upon PhonePe callback.',
        },
        {
          title: '📱 Twilio SMS Notification Hub',
          icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
          desc: 'Automate SMS payment reminders, urgent maintenance updates, and dispatch emergency SMS broadcasts to all resident mobile numbers.',
          tip: 'Tip: Check the SMS Center tab to view sent logs or configure trigger toggles.',
        },
        {
          title: '📊 Comprehensive Exportable Reports',
          icon: <Award className="w-8 h-8 text-amber-600" />,
          desc: 'Generate PDF and Excel reports for Revenue, Occupancy, Resident KYC, and Maintenance resolution metrics.',
          tip: 'Tip: Export official receipts with 1-click PDF download.',
        },
      ];
    } else if (role === 'staff') {
      return [
        {
          title: '🛠️ Assigned Maintenance Queue',
          icon: <Wrench className="w-8 h-8 text-emerald-600" />,
          desc: 'View tickets assigned directly to you. Update ticket statuses from PENDING to IN_PROGRESS and RESOLVED with 1 click.',
          tip: 'Tip: Changing a ticket status automatically notifies the resident via SMS.',
        },
        {
          title: '🏠 Resident Contact Directory',
          icon: <UserCheck className="w-8 h-8 text-blue-600" />,
          desc: 'Quickly find resident room numbers, phone details, and emergency contacts when handling room requests or emergencies.',
          tip: 'Tip: Keep resident emergency numbers handy during night shifts.',
        },
        {
          title: '🚨 Emergency Alerts & Operations',
          icon: <Bell className="w-8 h-8 text-rose-600" />,
          desc: 'Access hostel notices and emergency broadcasts directly from your staff operations dashboard.',
          tip: 'Tip: Report urgent building issues to Warden via the staff portal.',
        },
      ];
    } else {
      // Resident
      return [
        {
          title: '🏠 Resident Dashboard & Room Info',
          icon: <Home className="w-8 h-8 text-purple-600" />,
          desc: 'View your room allocation, bed number, monthly rent breakdown, and active roommates at a glance.',
          tip: 'Tip: Your room details are linked to your profile.',
        },
        {
          title: '💳 Rent Payments via PhonePe UPI',
          icon: <CreditCard className="w-8 h-8 text-emerald-600" />,
          desc: 'Pay your monthly rent seamlessly using PhonePe UPI gateway and download instant payment receipts.',
          tip: 'Tip: Complete payment before the 10th of every month to avoid late fees.',
        },
        {
          title: '🎙️ Voice Dictation Maintenance Tickets',
          icon: <Mic className="w-8 h-8 text-blue-600" />,
          desc: 'Got a plumbing or electrical issue? Simply click the Voice Mic button to dictate your complaint effortlessly!',
          tip: 'Tip: Dictate both issue title and detailed description hands-free.',
        },
        {
          title: '📱 SMS Alerts & Notifications',
          icon: <MessageSquare className="w-8 h-8 text-amber-600" />,
          desc: 'Receive instant SMS alerts on your mobile phone for payment due dates, maintenance status updates, and emergency notices.',
          tip: 'Tip: Make sure your mobile phone number is up to date in your profile.',
        },
      ];
    }
  };

  const tourSteps = getRoleTourSteps();

  const handleNextTour = () => {
    if (tourIndex < tourSteps.length - 1) {
      setTourIndex(tourIndex + 1);
    } else {
      setStep(4);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFinishOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`gh_onboarding_completed_${user.id}`, 'true');
    }
    localStorage.setItem(`gh_onboarding_completed_role_${role}`, 'true');
    if (onComplete) onComplete();
    onClose();
  };

  const saveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => {
      setStep(3);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Onboarding Guide
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              {role} Setup
            </span>
          </div>
          <h2 className="text-xl font-black">
            {step === 1 && `Welcome to Grand Horizon, ${user?.name || 'User'}! 👋`}
            {step === 2 && 'Step 1: Complete Your Profile'}
            {step === 3 && `Step 2: Core ${role.toUpperCase()} Features Tour`}
            {step === 4 && '🎉 You Are All Set!'}
          </h2>

          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step === s ? 'w-8 bg-white' : step > s ? 'w-4 bg-blue-300' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: WELCOME & OVERVIEW */}
          {step === 1 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 shadow-sm">
                {role === 'admin' && <ShieldCheck className="w-8 h-8" />}
                {role === 'staff' && <Wrench className="w-8 h-8" />}
                {role === 'resident' && <Home className="w-8 h-8" />}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Welcome to Your {role === 'admin' ? 'Admin Portal' : role === 'staff' ? 'Staff Workspace' : 'Resident Portal'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Grand Horizon Hostel Management System simplifies room allocations, PhonePe UPI rent billing, voice-dictated maintenance tickets, and Twilio SMS alerts.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block">⚡ Quick Setup Summary:</span>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Verify contact details & SMS notification settings
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Explore key {role} tools & shortcuts
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Get instant access to support & guidelines
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Start Onboarding Setup <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PROFILE COMPLETION */}
          {step === 2 && (
            <form onSubmit={saveProfileInfo} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Confirm your contact phone number to receive critical SMS notifications & alerts.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone Number (for SMS Alerts) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 12345"
                  />
                </div>
              </div>

              {role === 'resident' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 00001"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">SMS Mobile Notifications</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive payment due reminders, maintenance updates & emergency broadcasts.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsOptIn(!smsOptIn)}
                  className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                    smsOptIn ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      smsOptIn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {profileSaved ? 'Saved! Proceeding...' : 'Save Profile & Continue'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CORE FEATURE TOUR */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {tourSteps[tourIndex].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      Feature {tourIndex + 1} of {tourSteps.length}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {tourSteps[tourIndex].title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tourSteps[tourIndex].desc}
                </p>

                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] rounded-xl flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{tourSteps[tourIndex].tip}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => (tourIndex > 0 ? setTourIndex(tourIndex - 1) : setStep(2))}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="text-xs font-bold text-slate-400">
                  {tourIndex + 1} / {tourSteps.length}
                </div>

                <button
                  onClick={handleNextTour}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
                >
                  {tourIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next Feature'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ALL SET & EXPLORE */}
          {step === 4 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  You are all set to use Grand Horizon!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Your profile and contact preferences have been recorded. You can restart this tour anytime from the top navigation bar.
                </p>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-300 text-xs rounded-2xl text-left font-medium space-y-1">
                <span className="font-bold block">💡 Pro Tip for {role.toUpperCase()}:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {role === 'admin' && 'Use the SMS Notification tab to send emergency broadcasts or monitor billing activity.'}
                  {role === 'staff' && 'Check your assigned maintenance queue daily to update residents on progress.'}
                  {role === 'resident' && 'Use the Voice Mic button in the maintenance section to dictate complaints hands-free.'}
                </p>
              </div>

              <button
                onClick={handleFinishOnboarding}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Go to Dashboard Now <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
