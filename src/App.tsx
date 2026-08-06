import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import Home from '../app/page';

export default function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}
