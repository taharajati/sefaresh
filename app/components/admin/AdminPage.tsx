'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrdersList from '../OrdersList';
import { Layers, Users, Settings, Package, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout, getOrders } from '../../lib/api';

interface AdminPageProps {
  token: string;
  onLogout?: () => void;
}

const AdminPage = ({ token, onLogout }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState('orders');
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-violet-700">پنل مدیریت</h1>
          <p className="text-sm text-gray-500 mt-1">سیستم مدیریت فروشگاه</p>
        </div>
        
        <div className="py-4 flex-grow">
          <nav className="px-4 space-y-1">
            <Link href="/" className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
              <Home className="ml-2 h-5 w-5 text-gray-500" />
              بازگشت به سایت
            </Link>
            
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'orders' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className={`ml-2 h-5 w-5 ${activeTab === 'orders' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت سفارش‌ها
            </button>
            
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'products' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Layers className={`ml-2 h-5 w-5 ${activeTab === 'products' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت محصولات
            </button>
            
            <button 
              onClick={() => setActiveTab('customers')}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'customers' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className={`ml-2 h-5 w-5 ${activeTab === 'customers' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت مشتریان
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'settings' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className={`ml-2 h-5 w-5 ${activeTab === 'settings' ? 'text-violet-600' : 'text-gray-500'}`} />
              تنظیمات
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="ml-2 h-5 w-5 text-red-500" />
              خروج از سیستم
            </button>
          </nav>
        </div>
        
        <div className="px-6 py-4 border-t">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-violet-600 font-medium">مد</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">مدیر سیستم</p>
              <p className="text-xs text-gray-500">admin@sefaresh.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar button */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button 
          onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
          className="p-3 bg-violet-600 rounded-full shadow-lg text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden fixed inset-0 z-20 bg-black bg-opacity-50">
        <div className="bg-white w-64 h-full overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-violet-700">پنل مدیریت</h1>
            <button 
              onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="space-y-1">
            <Link href="/" className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
              <Home className="ml-2 h-5 w-5 text-gray-500" />
              بازگشت به سایت
            </Link>
            
            <button 
              onClick={() => {
                setActiveTab('orders');
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'orders' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className={`ml-2 h-5 w-5 ${activeTab === 'orders' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت سفارش‌ها
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('products');
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'products' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Layers className={`ml-2 h-5 w-5 ${activeTab === 'products' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت محصولات
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('customers');
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'customers' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className={`ml-2 h-5 w-5 ${activeTab === 'customers' ? 'text-violet-600' : 'text-gray-500'}`} />
              مدیریت مشتریان
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('settings');
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
              className={`flex items-center w-full px-2 py-2 text-sm rounded-lg ${activeTab === 'settings' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className={`ml-2 h-5 w-5 ${activeTab === 'settings' ? 'text-violet-600' : 'text-gray-500'}`} />
              تنظیمات
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="ml-2 h-5 w-5 text-red-500" />
              خروج از سیستم
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab === 'orders' && 'مدیریت سفارش‌ها'}
              {activeTab === 'products' && 'مدیریت محصولات'}
              {activeTab === 'customers' && 'مدیریت مشتریان'}
              {activeTab === 'settings' && 'تنظیمات سیستم'}
            </h1>
            
            <div className="mt-2 md:mt-0 flex items-center space-x-2 space-x-reverse">
              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">آنلاین</span>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                خروج
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-4 md:p-6">
          {activeTab === 'orders' && <OrdersList />}
          
          {activeTab === 'products' && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-violet-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">مدیریت محصولات</h3>
              <p className="text-gray-500 mb-4">در نسخه بعدی در دسترس خواهد بود</p>
            </div>
          )}
          
          {activeTab === 'customers' && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-violet-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">مدیریت مشتریان</h3>
              <p className="text-gray-500 mb-4">در نسخه بعدی در دسترس خواهد بود</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-violet-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">تنظیمات سیستم</h3>
              <p className="text-gray-500 mb-4">در نسخه بعدی در دسترس خواهد بود</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage; 