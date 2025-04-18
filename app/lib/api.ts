import axios from 'axios';
import { Order, ApiResponse } from './types';

// آدرس API سرور 
const API_URL = 'http://5.34.204.73:3002/api';

// متغیر برای کنترل وضعیت اتصال به سرور
let isServerAvailable = false;
let hasCheckedServer = false;

// از این تابع برای لاگ کردن و دیباگ کردن استفاده می‌کنیم
const logAPIAction = (action: string, result: any, success: boolean) => {
  console.log(`API ${action} ${success ? 'SUCCESS' : 'FAILED'}:`, result);
};

// بررسی اتصال به سرور
export const checkServerConnection = async (): Promise<boolean> => {
  if (hasCheckedServer) return isServerAvailable;
  
  try {
    console.log('Checking server connection...');
    const response = await fetch(`${API_URL}/health`, { 
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // تایم‌اوت 3 ثانیه
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);
    
    isServerAvailable = response !== null && response.ok === true;
    hasCheckedServer = true;
    console.log(`Server connection check result: ${isServerAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
    return isServerAvailable;
  } catch (error) {
    console.warn('Server check failed:', error);
    isServerAvailable = false;
    hasCheckedServer = true;
    return false;
  }
};

export const submitOrder = async (orderData: FormData): Promise<ApiResponse> => {
  console.log('Submitting order to SQLite database...');
  
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: orderData,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText
      });
      
      throw new Error(`خطای HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Order submitted successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error in submitOrder:', error);
    return {
      success: false,
      message: 'خطا در ثبت سفارش',
      errorDetails: { error: String(error) }
    };
  }
};

export const getOrders = async (token?: string): Promise<ApiResponse> => {
  try {
    console.log('Fetching orders from SQLite database...');
    
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Orders fetched successfully:', data);
    
    return {
      success: true,
      message: 'سفارش‌ها با موفقیت دریافت شدند',
      data
    };
  } catch (error) {
    console.error('Error fetching orders from API:', error);
    return {
      success: false,
      message: 'خطا در دریافت سفارش‌ها',
      errorDetails: { error: String(error) }
    };
  }
};

export const loginAdmin = async (username: string, password: string): Promise<ApiResponse> => {
  try {
    console.log('Logging in as admin...');
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      return {
        success: true,
        message: 'ورود موفقیت‌آمیز',
        data: { token: data.token }
      };
    } else {
      return {
        success: false,
        message: 'خطا در ورود به سیستم'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // برای اهداف نمایشی، اگر نام کاربری و رمز عبور مطابق باشد، اجازه ورود را بدهیم
    if (username === 'admin' && password === 'admin123') {
      const token = 'sample_token_' + Math.random().toString(36).substring(2);
      localStorage.setItem('adminToken', token);
      
      return {
        success: true,
        message: 'ورود موفقیت‌آمیز',
        data: { token }
      };
    }
    
    return {
      success: false,
      message: 'نام کاربری یا رمز عبور اشتباه است'
    };
  }
};

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    console.log(`Updating order ${orderId} status to ${status}...`);
    
    const response = await fetch(`${API_URL}/orders?id=${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Order status updated successfully:', data);
    
    return {
      success: true,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد'
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت سفارش'
    };
  }
}

export const logout = (): void => {
  localStorage.removeItem('adminToken');
  console.log('Logged out successfully');
}; 