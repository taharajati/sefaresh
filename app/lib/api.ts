import axios from 'axios';
import { Order, ApiResponse } from './types';

// آدرس API با آدرس سرور واقعی
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  console.log('Submitting order...');
  
  // اگر هنوز وضعیت سرور را چک نکردیم
  if (!hasCheckedServer) {
    await checkServerConnection();
  }
  
  // اگر سرور در دسترس نیست، مستقیم از API مجازی استفاده کنیم
  if (!isServerAvailable) {
    console.log('Server is not available, using mock API directly');
    return await useMockApi(orderData);
  }
  
  // سرور در دسترس است، سعی کنیم از API واقعی استفاده کنیم
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: orderData,
      // اضافه کردن هدرهای Cache-Control برای جلوگیری از استفاده از کش
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // تایم‌اوت 5 ثانیه
      signal: AbortSignal.timeout(5000)
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
      
      throw new Error(`خطای HTTP: ${response.status} ${response.statusText}`);
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
    // تبدیل FormData به یک آبجکت ساده
    const formObject: Record<string, any> = {};
    orderData.forEach((value, key) => {
      formObject[key] = value;
    });
    
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
  // اگر هنوز وضعیت سرور را چک نکردیم
  if (!hasCheckedServer) {
    await checkServerConnection();
  }
  
  // اگر سرور در دسترس نیست، مستقیم از localStorage استفاده کنیم
  if (!isServerAvailable) {
    console.log('Server is not available, using localStorage directly for orders');
    return getOrdersFromLocalStorage();
  }
  
  try {
    console.log('Fetching orders from API with token:', token);
    
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 5000 // 5 second timeout
    });
    
    logAPIAction('getOrders', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders from API:', error);
    
    // اگر به API دسترسی نداریم، از localStorage استفاده کن
    return getOrdersFromLocalStorage();
  }
};

// دریافت اطلاعات یک سفارش با شناسه خاص
export const getOrderById = async (id: string, token: string): Promise<ApiResponse> => {
  // اگر هنوز وضعیت سرور را چک نکردیم
  if (!hasCheckedServer) {
    await checkServerConnection();
  }
  
  // اگر سرور در دسترس نیست، مستقیم از localStorage استفاده کنیم
  if (!isServerAvailable) {
    console.log('Server is not available, using localStorage directly for order');
    return getOrderByIdFromLocalStorage(id);
  }
  
  try {
    console.log(`Fetching order ${id} from API with token:`, token);
    
    const response = await axios.get(`${API_URL}/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 5000 // 5 second timeout
    });
    
    logAPIAction('getOrderById', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id} from API:`, error);
    
    // اگر به API دسترسی نداریم، از localStorage استفاده کن
    return getOrderByIdFromLocalStorage(id);
  }
};

// دریافت یک سفارش از localStorage با شناسه خاص
function getOrderByIdFromLocalStorage(id: string): ApiResponse {
  try {
    console.log(`Getting order ${id} from localStorage`);
    const ordersFromStorage = localStorage.getItem('orders');
    
    if (!ordersFromStorage) {
      console.log('No orders found in localStorage');
      return { 
        success: false, 
        message: 'سفارش مورد نظر یافت نشد', 
        data: null 
      };
    }
    
    const parsedOrders = JSON.parse(ordersFromStorage);
    if (!Array.isArray(parsedOrders)) {
      console.warn('Orders in localStorage is not an array');
      return { 
        success: false, 
        message: 'فرمت داده‌های ذخیره شده نامعتبر است', 
        data: null 
      };
    }
    
    const order = parsedOrders.find((order: any) => order.id === id);
    
    if (!order) {
      console.log(`Order ${id} not found in localStorage`);
      return { 
        success: false, 
        message: 'سفارش مورد نظر یافت نشد', 
        data: null 
      };
    }
    
    console.log(`Found order ${id} in localStorage`);
    return { 
      success: true, 
      message: 'سفارش مورد نظر یافت شد', 
      data: order 
    };
  } catch (error) {
    console.error(`Error getting order ${id} from localStorage:`, error);
    return { 
      success: false, 
      message: 'خطا در دریافت سفارش از حافظه محلی', 
      data: null 
    };
  }
}

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
  // اگر هنوز وضعیت سرور را چک نکردیم
  if (!hasCheckedServer) {
    await checkServerConnection();
  }
  
  // اگر سرور در دسترس نیست و اطلاعات کاربری درست است، توکن جعلی بسازیم
  if (!isServerAvailable && username === 'shop_admin' && password === 'Sefaresh@1401') {
    console.log('Server is not available, using mock login');
    const mockToken = 'mock_token_' + Date.now();
    localStorage.setItem('adminToken', mockToken);
    
    return {
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      data: { token: mockToken }
    };
  }
  
  // سرور در دسترس است، سعی کنیم از API واقعی استفاده کنیم
  try {
    console.log('Attempting login with username:', username);
    
    const response = await axios.post(`${API_URL}/admin/login`, { username, password }, {
      timeout: 5000, // 5 second timeout
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    logAPIAction('loginAdmin', response.data, response.data.success);
    return response.data;
  } catch (error) {
    console.error('Login error from API:', error);
    
    // اگر اطلاعات کاربری درست است اما API در دسترس نیست
    if (username === 'shop_admin' && password === 'Sefaresh@1401') {
      const mockToken = 'mock_token_' + Date.now();
      localStorage.setItem('adminToken', mockToken);
      
      return {
        success: true,
        message: 'ورود موفقیت‌آمیز بود (حالت آفلاین)',
        data: { token: mockToken }
      };
    }
    
    // اطلاعات کاربری نادرست است
    return {
      success: false,
      message: 'نام کاربری یا رمز عبور اشتباه است',
    };
  }
};

export async function updateOrderStatus(orderId: string, status: string) {
  // اگر هنوز وضعیت سرور را چک نکردیم
  if (!hasCheckedServer) {
    await checkServerConnection();
  }
  
  // اگر سرور در دسترس نیست، فقط در localStorage به‌روزرسانی کنیم
  if (!isServerAvailable) {
    console.log('Server is not available, updating order status only in localStorage');
    return updateOrderStatusInLocalStorage(orderId, status);
  }
  
  try {
    console.log(`Updating order ${orderId} status to ${status} via API`);
    
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const data = await response.json();
    logAPIAction('updateOrderStatus', data, response.ok);
    
    // همزمان در localStorage هم به‌روزرسانی کنیم
    updateOrderStatusInLocalStorage(orderId, status);
    
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