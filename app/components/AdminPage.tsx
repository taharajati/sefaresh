'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../lib/api';
import OrdersList from './OrdersList';
import { Package, ShoppingBasket, Settings, Image, Layers } from 'lucide-react';

interface AdminPageProps {
  token: string;
  onLogout?: () => void;
}

const AdminPage = ({ token, onLogout }: AdminPageProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');

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

      {/* منوی اصلی */}
      <div className="bg-white border-b border-gray-200 mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 space-x-reverse">
            <Link href="/admin" 
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium ${
                activeTab === 'orders' 
                  ? 'text-violet-600 border-b-2 border-violet-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBasket className="w-5 h-5 ml-1" />
              سفارش‌ها
            </Link>
            <Link href="/admin/products" 
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium ${
                activeTab === 'products' 
                  ? 'text-violet-600 border-b-2 border-violet-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="w-5 h-5 ml-1" />
              محصولات
            </Link>
            <Link href="/admin/gallery" 
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium ${
                activeTab === 'gallery' 
                  ? 'text-violet-600 border-b-2 border-violet-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('gallery')}
            >
              <Image className="w-5 h-5 ml-1" />
              گالری تصاویر
            </Link>
            <Link href="/admin/product-images" 
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium ${
                activeTab === 'product-images' 
                  ? 'text-violet-600 border-b-2 border-violet-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('product-images')}
            >
              <Layers className="w-5 h-5 ml-1" />
              تصاویر محصولات
            </Link>
            <Link href="/admin/settings" 
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium ${
                activeTab === 'settings' 
                  ? 'text-violet-600 border-b-2 border-violet-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5 ml-1" />
              تنظیمات
            </Link>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'orders' && <OrdersList token={token} />}
      </main>
    </div>
  );
};

export default AdminPage; 