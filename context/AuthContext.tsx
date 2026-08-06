'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../lib/types';
import { setupMockFetchInterceptor } from '../lib/store';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
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

  const login = async (email: string, password?: string, role?: Role): Promise<User> => {
    // Auto infer role from email or explicit argument if provided
    let userRole: Role = role || 'resident';
    if (email.includes('admin') || password === 'admin123') {
      userRole = 'admin';
    } else if (email.includes('staff') || password === 'staff123') {
      userRole = 'staff';
    }

    let newUser: User = {
      id: 'res-101',
      name: 'Aarav Sharma',
      email: email || 'aarav@example.com',
      role: userRole,
      roomNumber: '101',
      roomId: 'room-101',
      phone: '+91 98765 12345',
    };

    if (userRole === 'admin') {
      newUser = {
        id: 'admin-1',
        name: 'Dr. Rajesh Verma (Warden)',
        email: email || 'admin@grandhorizon.com',
        role: 'admin',
        phone: '+91 98765 00001',
      };
    } else if (userRole === 'staff') {
      newUser = {
        id: 'staff-1',
        name: 'Suresh Kumar',
        email: email || 'suresh@grandhorizon.com',
        role: 'staff',
        phone: '+91 98765 88888',
      };
    }

    setUser(newUser);
    localStorage.setItem('gh_user_session', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const newUser: User = {
      id: `${data.role}-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || '+91 98765 43210',
      roomNumber: data.role === 'resident' ? '101' : undefined,
    };

    setUser(newUser);
    localStorage.setItem('gh_user_session', JSON.stringify(newUser));
    return newUser;
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

