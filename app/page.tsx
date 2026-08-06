'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/auth/AuthModal';

// Landing Components
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FacilitiesSection from '../components/landing/FacilitiesSection';
import RoomTypesSection from '../components/landing/RoomTypesSection';
import GallerySection from '../components/landing/GallerySection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FaqSection from '../components/landing/FaqSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';

// Admin Views
import AdminDashboard from '../components/admin/AdminDashboard';
import RoomManagement from '../components/admin/RoomManagement';
import ResidentManagement from '../components/admin/ResidentManagement';
import StaffManagement from '../components/admin/StaffManagement';
import SmartBilling from '../components/admin/SmartBilling';
import MaintenanceAdmin from '../components/admin/MaintenanceAdmin';
import ReportsView from '../components/admin/ReportsView';

// Role Dashboards
import ResidentDashboard from '../components/resident/ResidentDashboard';
import StaffDashboard from '../components/staff/StaffDashboard';

import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'admin' | 'resident' | 'staff'>('resident');

  // Admin Active Sub-Tab
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'rooms' | 'residents' | 'staff' | 'billing' | 'maintenance' | 'reports'
  >('dashboard');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleOpenAuth = (role: 'admin' | 'resident' | 'staff' = 'resident') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans`}>
      {/* NAVBAR */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenAuth={handleOpenAuth}
        currentAdminTab={adminTab}
        onAdminTabChange={setAdminTab}
      />

      {/* PUBLIC LANDING PAGE (Unauthenticated) */}
      {!isAuthenticated ? (
        <main>
          <HeroSection
            onOpenAuth={() => handleOpenAuth('resident')}
            onOpenAdminPortal={() => handleOpenAuth('admin')}
          />
          <AboutSection />
          <FacilitiesSection />
          <RoomTypesSection
            onSelectRoomCategory={() => handleOpenAuth('resident')}
          />
          <GallerySection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <ContactSection />
          <Footer />
        </main>
      ) : (
        /* AUTHENTICATED PORTAL VIEW */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ADMIN / WARDEN VIEW */}
          {user?.role === 'admin' && (
            <div className="space-y-6">
              {/* Admin Navigation Sub-Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Overview Dashboard
                </button>

                <button
                  onClick={() => setAdminTab('rooms')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'rooms'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Rooms Inventory
                </button>

                <button
                  onClick={() => setAdminTab('residents')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'residents'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" /> Residents Directory
                </button>

                <button
                  onClick={() => setAdminTab('staff')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'staff'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Wrench className="w-4 h-4" /> Staff Roster
                </button>

                <button
                  onClick={() => setAdminTab('billing')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'billing'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Receipt className="w-4 h-4" /> Smart Billing & Invoices
                </button>

                <button
                  onClick={() => setAdminTab('maintenance')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'maintenance'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Wrench className="w-4 h-4" /> Maintenance Tickets
                </button>

                <button
                  onClick={() => setAdminTab('reports')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    adminTab === 'reports'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Management Reports
                </button>
              </div>

              {/* Render Admin Views */}
              {adminTab === 'dashboard' && <AdminDashboard onNavigate={setAdminTab} />}
              {adminTab === 'rooms' && <RoomManagement />}
              {adminTab === 'residents' && <ResidentManagement />}
              {adminTab === 'staff' && <StaffManagement />}
              {adminTab === 'billing' && <SmartBilling />}
              {adminTab === 'maintenance' && <MaintenanceAdmin />}
              {adminTab === 'reports' && <ReportsView />}
            </div>
          )}

          {/* RESIDENT VIEW */}
          {user?.role === 'resident' && <ResidentDashboard />}

          {/* STAFF VIEW */}
          {user?.role === 'staff' && <StaffDashboard />}
        </main>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole={authRole}
      />
    </div>
  );
}
