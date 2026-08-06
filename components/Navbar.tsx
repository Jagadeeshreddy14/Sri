'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CreditCard,
  Phone,
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: (role?: 'admin' | 'resident' | 'staff') => void;
  currentAdminTab?: string;
  onAdminTabChange?: (tab: any) => void;
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
}: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">
              Grand Horizon
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-1 block">
              Hostel Management System
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        {!isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-blue-600 transition">About Us</a>
            <a href="#facilities" className="hover:text-blue-600 transition">Facilities</a>
            <a href="#rooms" className="hover:text-blue-600 transition">Room Types</a>
            <a href="#gallery" className="hover:text-blue-600 transition">Gallery</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing Tiers</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </nav>
        ) : null}

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('resident')}
                className="px-4 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-2xl transition"
              >
                Resident Portal
              </button>
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Login
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 block">
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-2xl transition text-xs font-bold flex items-center gap-1.5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {!isAuthenticated ? (
            <>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 py-1"
              >
                About Us
              </a>
              <a
                href="#facilities"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 py-1"
              >
                Facilities
              </a>
              <a
                href="#rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 py-1"
              >
                Room Types
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 py-1"
              >
                Pricing Tiers
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('resident');
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl"
                >
                  Resident Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('admin');
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Admin Portal Login
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
