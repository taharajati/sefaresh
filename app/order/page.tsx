import OrderForm from '@/app/components/OrderForm';
import { ArrowRight, ClipboardCheck, Smartphone, ShoppingBag, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 space-x-reverse">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-violet-600">
                <span>خانه</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-400 rotate-180 mx-2" />
                <span className="text-sm font-medium text-violet-600">ثبت سفارش</span>
              </div>
            </li>
          </ol>
        </nav>
    
        {/* Order Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md hover:border-violet-100 transition-all duration-300">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
              <ClipboardCheck className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">۱. تکمیل فرم سفارش</h3>
            <p className="text-gray-600">اطلاعات مورد نیاز فروشگاه خود را وارد کنید و پلن مناسب را انتخاب نمایید.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md hover:border-violet-100 transition-all duration-300">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
              <Smartphone className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">۲. تماس کارشناسان</h3>
            <p className="text-gray-600">کارشناسان ما در اسرع وقت با شما تماس گرفته و جزئیات را نهایی می‌کنند.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md hover:border-violet-100 transition-all duration-300">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
              <ShoppingBag className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">۳. طراحی و تحویل</h3>
            <p className="text-gray-600">فروشگاه شما طبق برنامه زمانی مشخص طراحی و تحویل داده می‌شود.</p>
          </div>
        </div>

        {/* Form Container with Better Styling */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-5 -right-5 w-28 h-28 bg-violet-100 rounded-full opacity-70 blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-indigo-100 rounded-full opacity-70 blur-3xl"></div>
          
          {/* Order Form Card */}
          <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden backdrop-blur-sm z-10">
            <div className="h-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            <div className="p-0 md:p-0">
              <OrderForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 