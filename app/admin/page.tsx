'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/app/components/AdminLogin';
import AdminPage from '@/app/components/AdminPage';

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // بررسی localStorage برای توکن ذخیره شده
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminPage token={token} onLogout={handleLogout} />;
} 