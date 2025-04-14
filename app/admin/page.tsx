'use client';

import { useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import OrdersList from '../components/OrdersList';

export default function AdminPage() {
  const [token, setToken] = useState<string>('');

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            پنل مدیریت
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {token ? 'لیست سفارش‌ها' : 'لطفاً وارد شوید'}
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {token ? (
                <OrdersList token={token} />
              ) : (
                <AdminLogin onLogin={handleLogin} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 