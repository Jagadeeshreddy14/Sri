'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'admin' | 'resident' | 'staff';
}

export default function AuthModal({ isOpen, onClose, defaultRole = 'resident' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'resident' | 'staff'>(defaultRole);

  // States for errors and success
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleQuickFill = (r: 'admin' | 'resident' | 'staff') => {
    setTab('login');
    setRole(r);
    setError(null);
    if (r === 'admin') {
      setEmail('admin@grandhorizon.com');
      setPassword('admin123');
    } else if (r === 'resident') {
      setEmail('resident@grandhorizon.com');
      setPassword('resident123');
    } else {
      setEmail('staff@grandhorizon.com');
      setPassword('staff123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone && !/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role, phone });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Demo Account Quick Buttons Header */}
        <div className="mb-6 pt-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('resident')}
              className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              🏠 Resident
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff')}
              className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              🛠️ Staff
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'login' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'register' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setError(null); setForgotSuccess(false); }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In To Portal'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Aarav Sharma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="aarav@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number (10 digits) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Role *</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="resident">Resident / Student</option>
                <option value="staff">Hostel Staff Member</option>
                <option value="admin">Hostel Admin / Warden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setTab('login')} className="text-xs text-blue-600 font-bold hover:underline">
                &larr; Back to Login
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Reset Code Sent!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Password reset link & verification code sent to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => setTab('login')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enter your registered account email and we'll send you password recovery instructions.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="name@domain.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending Request...' : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
