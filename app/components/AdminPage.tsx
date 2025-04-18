'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/api';
import OrdersList from './OrdersList';

interface AdminPageProps {
  token: string;
  onLogout?: () => void;
}

const AdminPage = ({ token, onLogout }: AdminPageProps) => {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">پنل مدیریت</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              خروج از حساب کاربری
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersList token={token} />
      </main>
    </div>
  );
};

export default AdminPage; 