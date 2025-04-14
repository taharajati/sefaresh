'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPage from '../components/admin/AdminPage';
import AdminLogin from '../components/AdminLogin';

export default function AdminPageRoute() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // در اجرای سمت کلاینت، اطلاعات توکن را از localStorage بخوان
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setToken(null);
  };

  // اگر در حال بارگیری هستیم، یک لودینگ نشان دهیم
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // اگر توکن وجود نداشت، فرم لاگین را نمایش بده
  if (!token) {
    return <AdminLogin onLogin={(newToken) => setToken(newToken)} />;
  }

  // اگر توکن داشتیم، پنل ادمین را نمایش بده
  return <AdminPage token={token} onLogout={handleLogout} />;
} 