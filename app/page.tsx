import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, Layout, Code, Server, Image } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">فروشگاه‌ساز</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="nav-link">
                خانه
              </Link>
              <Link href="/gallery" className="nav-link">
                گالری تصاویر
              </Link>
              <Link href="/order" className="nav-link">
                ثبت سفارش
              </Link>
              <Link href="/admin" className="nav-link">
                پنل مدیریت
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 sm:py-24">
            <h1 className="hero-title">
              <span className="block">طراحی فروشگاه اینترنتی</span>
              <span className="block text-blue-600">حرفه‌ای و مدرن</span>
            </h1>
            <p className="hero-subtitle">
              با ما فروشگاه اینترنتی خود را به بهترین شکل ممکن طراحی کنید. ما با استفاده از جدیدترین تکنولوژی‌ها و طراحی‌های مدرن، فروشگاه شما را به یک تجربه خرید منحصر به فرد تبدیل می‌کنیم.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/order"
                className="btn btn-primary px-8 py-3 text-base font-medium"
              >
                ثبت سفارش
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
              <Link
                href="/admin"
                className="btn btn-secondary px-8 py-3 text-base font-medium"
              >
                ورود به پنل مدیریت
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="section-title">ویژگی‌های منحصر به فرد</h2>
                <p className="section-subtitle">
                  بهترین راه برای شروع فروش آنلاین با جدیدترین تکنولوژی‌ها
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="feature-card">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600 mb-4">
                    <Layout className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">طراحی واکنش‌گرا</h3>
                  <p className="text-gray-600">
                    فروشگاه شما در تمام دستگاه‌ها به بهترین شکل نمایش داده می‌شود.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600 mb-4">
                    <Code className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">کد نویسی حرفه‌ای</h3>
                  <p className="text-gray-600">
                    با استفاده از جدیدترین تکنولوژی‌های وب، فروشگاه شما سریع و بهینه خواهد بود.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600 mb-4">
                    <Server className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">پشتیبانی ابری</h3>
                  <p className="text-gray-600">
                    فروشگاه شما بر روی سرورهای ابری با امنیت بالا میزبانی می‌شود.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600 mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">امنیت بالا</h3>
                  <p className="text-gray-600">
                    فروشگاه شما با جدیدترین استانداردهای امنیتی محافظت می‌شود.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
