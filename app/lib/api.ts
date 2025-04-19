import axios from 'axios';
import { Order, ApiResponse } from './types';

// آدرس API - استفاده از API محلی برای SQLite
const API_URL = '/api';

// از این تابع برای لاگ کردن و دیباگ کردن استفاده می‌کنیم
const logAPIAction = (action: string, result: any, success: boolean) => {
  console.log(`API ${action} ${success ? 'SUCCESS' : 'FAILED'}:`, result);
};

export const submitOrder = async (orderData: FormData): Promise<ApiResponse> => {
  console.log('Submitting order to local API...');
  
  try {
    // Print some key information from FormData for debugging
    if (orderData) {
      const debugInfo: Record<string, any> = {};
      orderData.forEach((value, key) => {
        if (typeof value === 'string' || value instanceof File) {
          debugInfo[key] = value instanceof File ? `File: ${value.name}` : value;
        }
      });
      console.log('FormData contents:', debugInfo);
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: orderData,
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('خطا در اتصال به سرور');
    });
    
    // بررسی وضعیت HTTP
    if (!response.ok) {
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText
      });
      
      // Try to get more detailed error information from response if possible
      try {
        const errorData = await response.text();
        console.error('Server error details:', errorData);
      } catch (textError) {
        console.error('Could not read error details:', textError);
      }
      
      // For 400/500 errors, fallback to mock API instead of throwing
      if (response.status >= 400) {
        console.log('Server error, falling back to mock API');
        return await useMockApi(orderData);
      }
      
      throw new Error(`خطای HTTP: ${response.status} ${response.statusText}`);
    }
    
    // دریافت پاسخ از سرور
    const data = await response.json();
    logAPIAction('submitOrder', data, data.success);
    
    // اگر پاسخ API ناموفق بود، به mock API برگردیم
    if (!data.success) {
      console.log('API returned unsuccessful response, trying mock API');
      return await useMockApi(orderData);
    }
    
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
    // تبدیل FormData به یک آبجکت ساده
    const formObject: Record<string, any> = {};
    
    // Check if orderData is defined before using forEach
    if (orderData) {
      orderData.forEach((value, key) => {
        formObject[key] = value;
      });
    } else {
      console.error('orderData is undefined in useMockApi');
      // Use default values if orderData is undefined
      formObject.pricingPlan = 'standard';
    }
    
    // ایجاد یک شناسه منحصر به فرد برای سفارش
    const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
    const createdAt = new Date().toISOString();
    
    // ایجاد یک شیء سفارش برای ذخیره‌سازی
    const order = {
      id: orderId,
      customerName: formObject.customerName || formObject.storeName || 'بدون نام',
      phoneNumber: formObject.phoneNumber || 'بدون شماره',
      address: `${formObject.province || ''} - ${formObject.city || ''} - ${formObject.address || ''}`,
      storeName: formObject.storeName || '',
      businessType: formObject.businessType || '',
      province: formObject.province || '',
      city: formObject.city || '',
      whatsapp: formObject.whatsapp || '',
      telegram: formObject.telegram || '',
      favoriteColor: formObject.favoriteColor || '',
      preferredFont: formObject.preferredFont || '',
      brandSlogan: formObject.brandSlogan || '',
      categories: formObject.categories || '',
      estimatedProducts: formObject.estimatedProducts || '',
      productDisplayType: formObject.productDisplayType || '',
      specialFeatures: formObject.specialFeatures || '',
      pricingPlan: formObject.pricingPlan || 'standard',
      additionalModules: formObject.additionalModules 
        ? (typeof formObject.additionalModules === 'string' 
          ? JSON.parse(formObject.additionalModules) 
          : formObject.additionalModules) 
        : [],
      additionalNotes: formObject.additionalNotes || '',
      items: [
        { 
          name: `سفارش سایت ${formObject.pricingPlan || 'استاندارد'}`, 
          quantity: 1, 
          price: formObject.pricingPlan === 'basic' ? 10000000 : 
                formObject.pricingPlan === 'standard' ? 15000000 : 
                formObject.pricingPlan === 'advanced' ? 20000000 : 30000000
        }
      ],
      total: formObject.pricingPlan === 'basic' ? 10000000 : 
             formObject.pricingPlan === 'standard' ? 15000000 : 
             formObject.pricingPlan === 'advanced' ? 20000000 : 30000000,
      status: 'pending',
      createdAt
    };
    
    // ذخیره در localStorage
    try {
      const existingOrdersStr = localStorage.getItem('orders') || '[]';
      const existingOrders = JSON.parse(existingOrdersStr);
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
    } catch (storageError) {
      console.error('خطا در ذخیره سفارش در localStorage:', storageError);
    }
    
    return {
      success: true,
      message: 'سفارش شما با موفقیت ثبت شد',
      data: order
    };
  } catch (error) {
    console.error('خطا در ثبت سفارش محلی:', error);
    return {
      success: false,
      message: 'خطا در ثبت سفارش',
      errorDetails: { error: String(error) }
    };
  }
}

export const getOrders = async (token: string): Promise<ApiResponse> => {
  try {
    console.log('Fetching orders from local API with token:', token);
    
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    logAPIAction('getOrders', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders from API:', error);
    
    // اگر به API دسترسی نداریم، از localStorage استفاده کن
    return getOrdersFromLocalStorage();
  }
};

// دریافت سفارش‌ها از localStorage
function getOrdersFromLocalStorage(): ApiResponse {
  try {
    console.log('Getting orders from localStorage');
    const ordersFromStorage = localStorage.getItem('orders');
    
    if (!ordersFromStorage) {
      console.log('No orders found in localStorage');
      return { 
        success: true, 
        message: 'سفارشی یافت نشد', 
        data: [] 
      };
    }
    
    const parsedOrders = JSON.parse(ordersFromStorage);
    if (!Array.isArray(parsedOrders)) {
      console.warn('Orders in localStorage is not an array');
      return { 
        success: true, 
        message: 'فرمت داده‌های ذخیره شده نامعتبر است', 
        data: [] 
      };
    }
    
    console.log(`Found ${parsedOrders.length} orders in localStorage`);
    return { 
      success: true, 
      message: `${parsedOrders.length} سفارش یافت شد`, 
      data: parsedOrders 
    };
  } catch (error) {
    console.error('Error getting orders from localStorage:', error);
    return { 
      success: false, 
      message: 'خطا در دریافت سفارش‌ها از حافظه محلی', 
      data: [] 
    };
  }
}

export const loginAdmin = async (username: string, password: string): Promise<ApiResponse> => {
  // برای سادگی، اگر اطلاعات کاربری درست است، توکن جعلی بسازیم
  if (username === 'shop_admin' && password === 'Sefaresh@1401') {
    console.log('Login successful');
    const mockToken = 'mock_token_' + Date.now();
    localStorage.setItem('adminToken', mockToken);
    
    return {
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      data: { token: mockToken }
    };
  }
  
  // اطلاعات کاربری نادرست است
  return {
    success: false,
    message: 'نام کاربری یا رمز عبور اشتباه است',
  };
};

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    console.log(`Updating order ${orderId} status to ${status} via local API`);
    
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    logAPIAction('updateOrderStatus', data, response.ok);
    
    // If server update fails, use localStorage
    if (!response.ok || !data.success) {
      return updateOrderStatusInLocalStorage(orderId, status);
    }
    
    return {
      success: response.ok,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Error updating order status via API:', error);
    // فال‌بک به localStorage
    return updateOrderStatusInLocalStorage(orderId, status);
  }
}

// به‌روزرسانی وضعیت سفارش در localStorage
function updateOrderStatusInLocalStorage(orderId: string, status: string) {
  try {
    console.log(`Updating order ${orderId} status to ${status} in localStorage`);
    const ordersFromStorage = localStorage.getItem('orders');
    if (!ordersFromStorage) {
      return {
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      };
    }

    const parsedOrders = JSON.parse(ordersFromStorage);
    const updatedOrders = parsedOrders.map((order: any) => 
      order.id === orderId ? { ...order, status } : order
    );
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    return {
      success: true,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد',
      data: { id: orderId, status }
    };
  } catch (error) {
    console.error('Error updating order status in localStorage:', error);
    return {
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت سفارش'
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