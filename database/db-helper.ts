// This file contains server-only code
import { saveOrder, getAllOrders, getOrderById, updateOrderStatus } from './sqlite';
import { headers } from 'next/headers';

export async function getOrdersFromDb() {
  try {
    // Use the imported function from sqlite.ts
    const orders = getAllOrders();
    return {
      success: true,
      message: `${orders.length} سفارش یافت شد`,
      data: orders
    };
  } catch (error) {
    console.error('Error getting orders from database:', error);
    return {
      success: false,
      message: 'خطا در دریافت سفارش‌ها از پایگاه داده',
      data: []
    };
  }
}

export async function saveOrderToDb(order: any) {
  try {
    const result = saveOrder(order);
    if (result) {
      return {
        success: true,
        message: 'سفارش با موفقیت ذخیره شد',
        data: order
      };
    } else {
      return {
        success: false,
        message: 'خطا در ذخیره سفارش',
        data: null
      };
    }
  } catch (error) {
    console.error('Error saving order to database:', error);
    return {
      success: false,
      message: 'خطا در ذخیره سفارش در پایگاه داده',
      data: null
    };
  }
}

export async function getOrderByIdFromDb(id: string) {
  try {
    const order = getOrderById(id);
    if (order) {
      return {
        success: true,
        message: 'سفارش با موفقیت دریافت شد',
        data: order
      };
    } else {
      return {
        success: false,
        message: 'سفارش مورد نظر یافت نشد',
        data: null
      };
    }
  } catch (error) {
    console.error(`Error getting order ${id} from database:`, error);
    return {
      success: false,
      message: 'خطا در دریافت سفارش از پایگاه داده',
      data: null
    };
  }
}

export async function updateOrderStatusInDb(id: string, status: string) {
  try {
    const result = updateOrderStatus(id, status);
    if (result) {
      return {
        success: true,
        message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد',
        data: { id, status }
      };
    } else {
      return {
        success: false,
        message: 'سفارش مورد نظر یافت نشد',
        data: null
      };
    }
  } catch (error) {
    console.error(`Error updating order ${id} status in database:`, error);
    return {
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت سفارش در پایگاه داده',
      data: null
    };
  }
} 