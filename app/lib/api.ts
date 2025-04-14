import axios from 'axios';
import { Order, ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const submitOrder = async (orderData: FormData): Promise<ApiResponse> => {
  console.log('Calling API to submit order...');
  
  try {
    // ارسال درخواست به API بک‌اند واقعی
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      body: orderData
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
    
    // اگر پاسخ 404 نبود، نتیجه را برگردان (برای پوشش حالتی که API بک‌اند در دسترس نیست)
    const data = await response.json();
    
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
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
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
    const response = await axios.post(`${API_URL}/admin/login`, { username, password });
    return response.data;
  } catch (error) {
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
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    return {
      success: response.ok,
      data: data.data,
      message: data.message
    };
  } catch (error) {
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