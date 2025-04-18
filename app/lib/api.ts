import axios from 'axios';
import { Order, ApiResponse } from './types';

// آدرس API با آدرس سرور واقعی
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://5.34.204.73:3003/api';

// از این تابع برای لاگ کردن و دیباگ کردن استفاده می‌کنیم
const logAPIAction = (action: string, result: any, success: boolean) => {
  console.log(`API ${action} ${success ? 'SUCCESS' : 'FAILED'}:`, result);
};

export const submitOrder = async (orderData: FormData): Promise<ApiResponse> => {
  console.log('Calling API to submit order...');
  
  try {
    // آدرس API را مستقیم استفاده می‌کنیم تا مطمئن شویم که درخواست به سرور ارسال می‌شود
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: orderData,
      // اضافه کردن هدرهای Cache-Control برای جلوگیری از استفاده از کش
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('خطا در اتصال به سرور');
    });
    
    // بررسی وضعیت HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `خطای HTTP: ${response.status} ${response.statusText}`
      }));
      
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      throw new Error(errorData.message || `خطای سرور: ${response.status}`);
    }
    
    // دریافت پاسخ از سرور
    const data = await response.json();
    logAPIAction('submitOrder', data, data.success);
    
    // اگر سفارش با موفقیت ثبت شده بود، آن را در localStorage هم ذخیره کن (به عنوان پشتیبان)
    if (data.success && data.data) {
      try {
        const existingOrdersStr = localStorage.getItem('orders') || '[]';
        const existingOrders = JSON.parse(existingOrdersStr);
        
        // اگر آیتم‌های سفارش وجود نداشت، آن را اضافه کن
        if (data.data && !data.data.items) {
          data.data.items = [{
            name: `سفارش سایت ${data.data.pricingPlan || 'استاندارد'}`,
            quantity: 1,
            price: data.data.pricingPlan === 'basic' ? 10000000 : 
                   data.data.pricingPlan === 'standard' ? 15000000 : 
                   data.data.pricingPlan === 'advanced' ? 20000000 : 30000000
          }];
        }
        
        existingOrders.push(data.data);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      } catch (storageError) {
        console.error('خطا در ذخیره سفارش در localStorage:', storageError);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in submitOrder, falling back to mock API:', error);
    
    // اگر به بک‌اند دسترسی نداریم، از API مجازی استفاده کن
    return await useMockApi(orderData);
  }
};

// API مجازی برای حالتی که سرور بک‌اند در دسترس نیست
async function useMockApi(orderData: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/mock-order', {
      method: 'POST',
      body: orderData
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'خطا در ارسال سفارش به API مجازی',
      errorDetails: { error: String(error) }
    };
  }
}

export const getOrders = async (token: string): Promise<ApiResponse> => {
  try {
    console.log('Fetching orders from API with token:', token);
    
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
    
    logAPIAction('getOrders', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در دریافت سفارش‌ها',
      };
    }
    return {
      success: false,
      message: 'خطا در دریافت سفارش‌ها',
    };
  }
};

export const loginAdmin = async (username: string, password: string): Promise<ApiResponse> => {
  try {
    console.log('Attempting login with username:', username);
    
    const response = await axios.post(`${API_URL}/admin/login`, { username, password });
    logAPIAction('loginAdmin', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در ورود',
      };
    }
    return {
      success: false,
      message: 'خطا در ورود',
    };
  }
};

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    logAPIAction('updateOrderStatus', data, response.ok);
    return {
      success: response.ok,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      message: 'خطا در ارتباط با سرور'
    };
  }
}

// تابع خروج از سیستم
export const logout = (): void => {
  try {
    // حذف توکن ادمین از localStorage
    localStorage.removeItem('adminToken');
    console.log('با موفقیت از سیستم خارج شدید');
  } catch (error) {
    console.error('خطا در خروج از سیستم:', error);
  }
}; 