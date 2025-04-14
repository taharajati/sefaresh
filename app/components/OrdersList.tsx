'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../lib/api';

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const result = await getOrders('all');
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('خطا در دریافت لیست سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        setError('خطا در به‌روزرسانی وضعیت سفارش');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید';
      case 'confirmed':
        return 'تایید شده';
      case 'delivered':
        return 'تحویل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center py-4">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">لیست سفارشات</h2>
      
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">هیچ سفارشی یافت نشد</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    سفارش #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('fa-IR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">مشتری:</span> {order.customerName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">شماره تماس:</span> {order.phoneNumber}
                </p>
                <p className="text-sm">
                  <span className="font-medium">آدرس:</span> {order.address}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900">محصولات:</h4>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price.toLocaleString('fa-IR')} تومان</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between font-medium">
                  <span>جمع کل:</span>
                  <span>{order.total.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    تایید سفارش
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    تحویل شد
                  </button>
                )}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    لغو سفارش
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 