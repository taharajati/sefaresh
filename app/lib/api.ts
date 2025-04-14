import axios from 'axios';
import { Order, ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const submitOrder = async (orderData: FormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در ارسال سفارش',
      };
    }
    return {
      success: false,
      message: 'خطا در ارسال سفارش',
    };
  }
};

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