import OrderForm from '../components/OrderForm';

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ثبت سفارش طراحی فروشگاه
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            لطفاً اطلاعات مورد نیاز را با دقت وارد کنید.
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <OrderForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 