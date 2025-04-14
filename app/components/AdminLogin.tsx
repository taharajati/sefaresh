'use client';

import { useState } from 'react';
import { loginAdmin } from '../lib/api';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hardcoded credentials for demo purposes
      if (username === 'shop_admin' && password === 'Sefaresh@1401') {
        // Create a dummy token
        const dummyToken = 'demo_token_' + Date.now();
        
        // ذخیره توکن در localStorage
        localStorage.setItem('adminToken', dummyToken);
        
        // Simulate network delay
        setTimeout(() => {
          setLoading(false);
          onLogin(dummyToken);
        }, 800);
        
        return;
      }
      
      // If not using hardcoded credentials, try the API
      const response = await loginAdmin(username, password);
      if (response.success && response.data?.token) {
        // ذخیره توکن در localStorage
        localStorage.setItem('adminToken', response.data.token);
        onLogin(response.data.token);
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">ورود به پنل مدیریت</h2>
          <div className="h-14 w-14 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-violet-600" />
          </div>
        </div>
        
        {/* Demo credentials notice */}
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 text-sm">
          <p className="font-bold mb-1">اطلاعات ورود به پنل مدیریت:</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              نام کاربری
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full pr-10 py-3 rounded-xl border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                placeholder="نام کاربری خود را وارد کنید"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              رمز عبور
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pr-10 py-3 rounded-xl border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                placeholder="رمز عبور خود را وارد کنید"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5" /> : 
                    <Eye className="h-5 w-5" />
                  }
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center bg-red-50 text-red-600 text-sm p-4 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ورود...
                </span>
              ) : (
                'ورود به پنل'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 