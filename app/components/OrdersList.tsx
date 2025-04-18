'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../lib/api';
import { Eye, Download, Search, Filter, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  
  // Основная информация
  storeName: string;
  businessType: string;
  province: string;
  city: string;
  whatsapp?: string;
  telegram?: string;
  
  // Брендинг
  favoriteColor?: string;
  preferredFont?: string;
  brandSlogan?: string;
  categories?: string;
  estimatedProducts?: string;
  productDisplayType?: string;
  specialFeatures?: string;
  logo?: string;
  productImages?: string[];
  
  // План
  pricingPlan: string;
  additionalModules?: any;
  additionalNotes?: string;
  
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface OrdersListProps {
  token?: string;
}

// Функция для получения отображаемого названия плана
const getPlanDisplayName = (planId: string): string => {
  const planNames: Record<string, string> = {
    'basic': 'پایه',
    'standard': 'استاندارد',
    'advanced': 'پیشرفته',
    'professional': 'حرفه‌ای',
    'enterprise': 'سازمانی'
  };
  
  return planNames[planId] || planId;
};

// Mock data for demonstration purposes
const mockOrders: Order[] = [
  {
    id: '1001',
    customerName: 'علی محمدی',
    phoneNumber: '09123456789',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    storeName: 'فروشگاه ایسوس',
    businessType: 'فروشگاه',
    province: 'تهران',
    city: 'تهران',
    items: [
      { name: 'لپ تاپ ایسوس', quantity: 1, price: 25000000 },
      { name: 'ماوس گیمینگ', quantity: 2, price: 850000 }
    ],
    total: 26700000,
    status: 'pending',
    pricingPlan: 'basic',
    additionalModules: ['blog', 'productUpload', 'payment'],
    createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
  },
  {
    id: '1002',
    customerName: 'زهرا کریمی',
    phoneNumber: '09187654321',
    address: 'اصفهان، خیابان چهارباغ، کوچه شهید احمدی، پلاک 45',
    storeName: 'فروشگاه سامسونگ',
    businessType: 'فروشگاه',
    province: 'اصفهان',
    city: 'اصفهان',
    items: [
      { name: 'گوشی سامسونگ S21', quantity: 1, price: 18500000 }
    ],
    total: 18500000,
    status: 'confirmed',
    pricingPlan: 'standard',
    additionalModules: ['blog', 'seo'],
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: '1003',
    customerName: 'محمد رضایی',
    phoneNumber: '09361234567',
    address: 'شیراز، بلوار زند، ساختمان آفتاب، واحد 12',
    storeName: 'فروشگاه محمد رضایی',
    businessType: 'ساختمان',
    province: 'شیراز',
    city: 'شیراز',
    items: [
      { name: 'هدفون بلوتوثی', quantity: 1, price: 2500000 },
      { name: 'پاوربانک 20000mAh', quantity: 1, price: 1200000 },
      { name: 'کابل شارژ تایپ سی', quantity: 2, price: 150000 }
    ],
    total: 4000000,
    status: 'delivered',
    pricingPlan: 'advanced',
    additionalModules: ['payment', 'analytics'],
    createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
  },
  {
    id: '1004',
    customerName: 'سارا احمدی',
    phoneNumber: '09127890123',
    address: 'مشهد، بلوار امام رضا، کوچه 15، پلاک 87',
    storeName: 'فروشگاه سارا احمدی',
    businessType: 'فروشگاه',
    province: 'مشهد',
    city: 'مشهد',
    items: [
      { name: 'تبلت اپل iPad Air', quantity: 1, price: 22000000 },
      { name: 'کیف تبلت', quantity: 1, price: 750000 }
    ],
    total: 22750000,
    status: 'cancelled',
    pricingPlan: 'professional',
    additionalModules: ['blog', 'chat', 'multiLanguage'],
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  }
];

export default function OrdersList({ token }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        // ابتدا سعی می‌کنیم داده‌ها را از API دریافت کنیم
        if (token) {
          const response = await getOrders(token);
          if (response.success && response.data) {
            console.log("داده‌های دریافتی از API:", response.data);
            setOrders(response.data);
            setLoading(false);
            return;
          } else {
            console.warn("دریافت داده از API ناموفق بود:", response);
          }
        }
        
        // اگر API در دسترس نبود، از localStorage استفاده می‌کنیم
        try {
          const ordersFromStorage = localStorage.getItem('orders');
          console.log("داده‌های ذخیره شده در localStorage:", ordersFromStorage);
          
          if (ordersFromStorage) {
            const parsedOrders = JSON.parse(ordersFromStorage);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              // پردازش داده‌های دریافتی
              const processedOrders = parsedOrders.map((order: any) => {
                // اطمینان از وجود همه فیلدهای لازم
                return {
                  id: order.id || `ORD-${Math.floor(Math.random() * 10000)}`,
                  customerName: order.customerName || order.storeName || 'بدون نام',
                  phoneNumber: order.phoneNumber || 'بدون شماره',
                  address: order.address || '',
                  storeName: order.storeName || '',
                  businessType: order.businessType || '',
                  province: order.province || '',
                  city: order.city || '',
                  whatsapp: order.whatsapp || '',
                  telegram: order.telegram || '',
                  pricingPlan: order.pricingPlan || 'standard',
                  additionalModules: order.additionalModules || [],
                  items: order.items || [{
                    name: `سفارش سایت ${order.pricingPlan || 'استاندارد'}`,
                    quantity: 1,
                    price: 15000000
                  }],
                  total: order.total || 15000000,
                  status: order.status || 'pending',
                  createdAt: order.createdAt || new Date().toISOString()
                };
              });
              
              console.log("داده‌های پردازش شده:", processedOrders);
              setOrders(processedOrders);
              setLoading(false);
              return;
            }
          }
        } catch (storageError) {
          console.error('خطا در دریافت سفارش‌ها از localStorage:', storageError);
        }
        
        // اگر هیچ داده‌ای دریافت نشد، از داده‌های نمونه استفاده کن
        console.log("استفاده از داده‌های نمونه");
        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('خطا در دریافت سفارش‌ها:', error);
        setError('خطا در دریافت لیست سفارش‌ها');
        setOrders(mockOrders); // از داده‌های نمونه استفاده کن
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    
    try {
      // اگر توکن وجود داشت، از API استفاده کن
      if (token) {
        const response = await updateOrderStatus(orderId, newStatus);
        if (response.success) {
          setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          ));
          setLoading(false);
          return;
        }
      }
      
      // اگر به API دسترسی نداشتیم، localStorage را به‌روزرسانی کن
      try {
        const ordersFromStorage = localStorage.getItem('orders');
        if (ordersFromStorage) {
          const parsedOrders = JSON.parse(ordersFromStorage);
          const updatedOrders = parsedOrders.map((order: Order) => 
            order.id === orderId ? { ...order, status: newStatus } : order
          );
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
          setOrders(updatedOrders);
        } else {
          // اگر در localStorage هم وجود نداشت، از حالت مجازی استفاده کن
          setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          ));
        }
      } catch (storageError) {
        console.error('خطا در به‌روزرسانی وضعیت سفارش در localStorage:', storageError);
        // در صورت خطا، فقط state را به‌روزرسانی کن
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی وضعیت سفارش:', error);
    } finally {
      setLoading(false);
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

  const refreshOrders = () => {
    setLoading(true);
    
    const fetchOrders = async () => {
      try {
        // اگر توکن وجود داشت، سعی کن از API دریافت کنی
        if (token) {
          const response = await getOrders(token);
          if (response.success && response.data) {
            setOrders(response.data);
            setLoading(false);
            return;
          }
        }
        
        // اگر به API دسترسی نداشتیم، از localStorage استفاده کن
        try {
          const ordersFromStorage = localStorage.getItem('orders');
          if (ordersFromStorage) {
            const parsedOrders = JSON.parse(ordersFromStorage);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              setOrders(parsedOrders);
              setLoading(false);
              return;
            }
          }
        } catch (storageError) {
          console.error('خطا در دریافت سفارش‌ها از localStorage:', storageError);
        }
        
        // اگر هیچ داده‌ای دریافت نشد، از داده‌های نمونه استفاده کن
        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('خطا در به‌روزرسانی لیست سفارش‌ها:', error);
        setOrders(mockOrders);
        setLoading(false);
      }
    };
    
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      (order.customerName && order.customerName.includes(searchTerm)) || 
      (order.storeName && order.storeName.includes(searchTerm)) || 
      (order.phoneNumber && order.phoneNumber.includes(searchTerm)) || 
      (order.id && order.id.includes(searchTerm));
      
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Функция для перевода названий модулей на персидский
  const getModuleTranslation = (moduleId: string): string => {
    const translations: Record<string, string> = {
      'blog': 'وبلاگ',
      'productUpload': 'آپلود محصول',
      'payment': 'درگاه پرداخت',
      'seo': 'بهینه‌سازی موتور جستجو',
      'analytics': 'تحلیل آمار',
      'mobileApp': 'اپلیکیشن موبایل',
      'multiLanguage': 'چند زبانه',
      'chat': 'چت آنلاین',
      'subscription': 'سیستم اشتراک',
      'affiliate': 'بازاریابی وابسته'
    };
    
    return translations[moduleId] || moduleId;
  };

  // Функция для получения строки с модулями
  const getModulesDisplay = (modules: any): string => {
    if (!modules) return '';
    
    try {
      // Если это массив
      if (Array.isArray(modules)) {
        return modules.map(getModuleTranslation).join('، ');
      }
      // Если это строка в JSON формате
      else if (typeof modules === 'string' && modules.startsWith('[')) {
        return JSON.parse(modules).map(getModuleTranslation).join('، ');
      }
      // Если это обычная строка
      else if (typeof modules === 'string') {
        return modules;
      }
      // Если это объект
      else if (typeof modules === 'object') {
        return Object.keys(modules).map(getModuleTranslation).join('، ');
      }
      
      return String(modules);
    } catch (error) {
      console.error('Ошибка при обработке additionalModules:', error);
      return String(modules);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-gray-600">در حال بارگذاری سفارش‌ها...</p>
      </div>
    );
  }

  // View order detail modal
  if (viewingOrder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">جزئیات سفارش #{viewingOrder.id}</h3>
            <button 
              onClick={() => setViewingOrder(null)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4 flex justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingOrder.status)}`}>
              {getStatusText(viewingOrder.status)}
            </span>
            <p className="text-sm text-gray-500">{new Date(viewingOrder.createdAt).toLocaleString('fa-IR')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 border-b pb-2">اطلاعات مشتری</h4>
              {viewingOrder.storeName && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">نام فروشگاه:</span>
                  <span className="text-gray-800">{viewingOrder.storeName}</span>
                </div>
              )}
              {viewingOrder.customerName && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">نام مشتری:</span>
                  <span className="text-gray-800">{viewingOrder.customerName}</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">شماره تماس:</span>
                <span className="text-gray-800 dir-ltr">{viewingOrder.phoneNumber}</span>
              </div>
              {viewingOrder.whatsapp && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">واتساپ:</span>
                  <span className="text-gray-800 dir-ltr">{viewingOrder.whatsapp}</span>
                </div>
              )}
              {viewingOrder.telegram && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">تلگرام:</span>
                  <span className="text-gray-800 dir-ltr">{viewingOrder.telegram}</span>
                </div>
              )}
              {viewingOrder.businessType && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">نوع کسب و کار:</span>
                  <span className="text-gray-800">{viewingOrder.businessType}</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">آدرس:</span>
                <span className="text-gray-800">
                  {viewingOrder.province && viewingOrder.city 
                    ? `${viewingOrder.province}، ${viewingOrder.city}، ${viewingOrder.address}` 
                    : viewingOrder.address}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 border-b pb-2">اطلاعات سفارش</h4>
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">شماره سفارش:</span>
                <span className="text-gray-800">{viewingOrder.id}</span>
              </div>
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">تاریخ ثبت:</span>
                <span className="text-gray-800">{new Date(viewingOrder.createdAt).toLocaleString('fa-IR')}</span>
              </div>
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">پلن انتخابی:</span>
                <span className="text-gray-800">{getPlanDisplayName(viewingOrder.pricingPlan)}</span>
              </div>
              {viewingOrder.additionalModules && viewingOrder.additionalModules.length > 0 && (
                <div className="space-y-1">
                  <span className="font-medium block text-gray-700">ماژول‌های اضافی:</span>
                  <span className="text-gray-800">
                    {getModulesDisplay(viewingOrder.additionalModules)}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                <span className="font-medium block text-gray-700">تعداد اقلام:</span>
                <span className="text-gray-800">{viewingOrder.items?.length || 0} مورد</span>
              </div>
            </div>
          </div>

          {/* Branding Information */}
          {(viewingOrder.favoriteColor || viewingOrder.preferredFont || viewingOrder.brandSlogan || viewingOrder.categories) && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">اطلاعات برندینگ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {viewingOrder.favoriteColor && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">رنگ مورد علاقه:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-6 w-6 rounded-full border border-gray-300" 
                          style={{ backgroundColor: viewingOrder.favoriteColor }}
                        ></div>
                        <span className="text-gray-800">{viewingOrder.favoriteColor}</span>
                      </div>
                    </div>
                  )}
                  {viewingOrder.preferredFont && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">فونت ترجیحی:</span>
                      <span className="text-gray-800">{viewingOrder.preferredFont}</span>
                    </div>
                  )}
                  {viewingOrder.brandSlogan && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">شعار برند:</span>
                      <span className="text-gray-800">{viewingOrder.brandSlogan}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {viewingOrder.categories && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">دسته‌بندی‌ها:</span>
                      <span className="text-gray-800">{viewingOrder.categories}</span>
                    </div>
                  )}
                  {viewingOrder.estimatedProducts && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">تعداد تقریبی محصولات:</span>
                      <span className="text-gray-800">{viewingOrder.estimatedProducts}</span>
                    </div>
                  )}
                  {viewingOrder.productDisplayType && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">نحوه نمایش محصولات:</span>
                      <span className="text-gray-800">{viewingOrder.productDisplayType}</span>
                    </div>
                  )}
                  {viewingOrder.specialFeatures && (
                    <div className="space-y-1">
                      <span className="font-medium block text-gray-700">ویژگی‌های خاص:</span>
                      <span className="text-gray-800">{viewingOrder.specialFeatures}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Notes */}
          {viewingOrder.additionalNotes && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">توضیحات اضافی</h4>
              <div className="text-gray-800 whitespace-pre-line">{viewingOrder.additionalNotes}</div>
            </div>
          )}
          
          {/* Product Images */}
          {viewingOrder.productImages && viewingOrder.productImages.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">تصاویر محصولات</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {viewingOrder.productImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={image} 
                      alt={`تصویر محصول ${index + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">محصول</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">تعداد</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت واحد</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت کل</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewingOrder.items && viewingOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{item.price.toLocaleString('fa-IR')} تومان</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-left">جمع کل:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-left">{viewingOrder.total.toLocaleString('fa-IR')} تومان</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={() => setViewingOrder(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50"
            >
              بستن
            </button>
            
            {viewingOrder.status === 'pending' && (
              <button
                onClick={() => {
                  handleStatusUpdate(viewingOrder.id, 'confirmed');
                  setViewingOrder(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
              >
                تایید سفارش
              </button>
            )}
            
            {viewingOrder.status === 'confirmed' && (
              <button
                onClick={() => {
                  handleStatusUpdate(viewingOrder.id, 'delivered');
                  setViewingOrder(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700"
              >
                تحویل شد
              </button>
            )}
            
            {(viewingOrder.status === 'pending' || viewingOrder.status === 'confirmed') && (
              <button
                onClick={() => {
                  handleStatusUpdate(viewingOrder.id, 'cancelled');
                  setViewingOrder(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700"
              >
                لغو سفارش
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <h2 className="text-xl font-bold text-gray-900">لیست سفارش‌ها</h2>
          <button 
            onClick={refreshOrders}
            className="p-1 rounded-full hover:bg-gray-100" 
            title="بارگذاری مجدد"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full sm:w-64 pr-10 py-2 px-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              placeholder="جستجو..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select 
              className="block w-full sm:w-44 pr-10 py-2 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-violet-500 focus:border-violet-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار تایید</option>
              <option value="confirmed">تایید شده</option>
              <option value="delivered">تحویل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {filteredOrders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 text-lg">هیچ سفارشی یافت نشد</p>
          <p className="text-gray-400 text-sm mt-1">سفارش‌ها در اینجا نمایش داده خواهند شد</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6">شماره</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">مشتری</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">تاریخ</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">مبلغ</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">وضعیت</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">عملیات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium text-gray-900 sm:pr-6">
                    {order.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {order.storeName || order.customerName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {order.total.toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="p-1 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full"
                      title="مشاهده جزئیات"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 