'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { setupMockFetchInterceptor, hostelStore } from '../lib/store';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
  roomNumber?: string;
}

interface StoredAccount extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  demoLogin: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Enable client mock fetch interceptor for all /api calls
    setupMockFetchInterceptor();

    // Read persisted user session from localStorage if available
    const saved = localStorage.getItem('gh_user_session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Helper to get registered accounts list from localStorage
  const getRegisteredAccounts = (): StoredAccount[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('gh_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const login = async (email: string, password?: string, role?: Role): Promise<User> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const accounts = getRegisteredAccounts();

    // Check if there is a registered account for this email
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (found) {
      const authenticatedUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone,
        roomNumber: found.roomNumber,
        roomId: found.roomId,
      };
      setUser(authenticatedUser);
      localStorage.setItem('gh_user_session', JSON.stringify(authenticatedUser));
      return authenticatedUser;
    }

    // Default / Demo fallback login logic
    let userRole: Role = role || 'resident';
    if (cleanEmail.includes('admin') || password === 'admin123') {
      userRole = 'admin';
    } else if (cleanEmail.includes('staff') || password === 'staff123') {
      userRole = 'staff';
    }

    let newUser: User = {
      id: 'res-101',
      name: 'Aarav Sharma',
      email: cleanEmail || 'aarav@example.com',
      role: userRole,
      roomNumber: '101',
      roomId: 'room-101',
      phone: '+91 98765 12345',
    };

    if (userRole === 'admin') {
      newUser = {
        id: 'admin-1',
        name: 'Dr. Rajesh Verma (Warden)',
        email: cleanEmail || 'admin@grandhorizon.com',
        role: 'admin',
        phone: '+91 98765 00001',
      };
    } else if (userRole === 'staff') {
      newUser = {
        id: 'staff-1',
        name: 'Suresh Kumar',
        email: cleanEmail || 'suresh@grandhorizon.com',
        role: 'staff',
        phone: '+91 98765 88888',
      };
    }

    setUser(newUser);
    localStorage.setItem('gh_user_session', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const assignedRole: Role = 'resident'; // Public registration is strictly for residents
    const newId = `resident-${Date.now()}`;

    const newUser: StoredAccount = {
      id: newId,
      name: data.name,
      email: cleanEmail,
      role: assignedRole,
      phone: data.phone || '+91 98765 43210',
      password: data.password || 'password123',
      roomNumber: data.roomNumber || '101',
    };

    // Save to registered accounts list in localStorage
    const accounts = getRegisteredAccounts();
    const updatedAccounts = [...accounts.filter((a) => a.email.toLowerCase() !== cleanEmail), newUser];
    localStorage.setItem('gh_registered_users', JSON.stringify(updatedAccounts));

    // Sync resident with hostelStore
    hostelStore.addResident({
      name: data.name,
      email: cleanEmail,
      phone: data.phone || '9876543210',
      emergencyContact: '9876500000',
      roomNumber: data.roomNumber || '101',
      depositAmount: 8500,
    });

    // Set active session
    const activeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      roomNumber: newUser.roomNumber,
      roomId: newUser.roomId,
    };

    setUser(activeUser);
    localStorage.setItem('gh_user_session', JSON.stringify(activeUser));
    return activeUser;
  };

  const demoLogin = (role: Role) => {
    login(`${role}@grandhorizon.com`, undefined, role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gh_user_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

