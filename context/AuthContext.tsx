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
    const cleanEmail = (email || '').trim().toLowerCase();
    let computedPassword = password;
    if (!computedPassword) {
      if (cleanEmail.includes('admin')) {
        computedPassword = 'admin123';
      } else if (cleanEmail.includes('staff')) {
        computedPassword = 'staff123';
      } else {
        computedPassword = 'resident123';
      }
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: cleanEmail, password: computedPassword, role }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }

    const authenticatedUser: User = await response.json();
    setUser(authenticatedUser);
    localStorage.setItem('gh_user_session', JSON.stringify(authenticatedUser));
    return authenticatedUser;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Registration failed');
    }

    const authenticatedUser: User = await response.json();
    setUser(authenticatedUser);
    localStorage.setItem('gh_user_session', JSON.stringify(authenticatedUser));
    return authenticatedUser;
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

