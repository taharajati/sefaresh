import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // دریافت داده‌های فرم
    const formData = await request.formData();
    
    // تبدیل به شیء برای لاگ کردن
    const formObject: Record<string, any> = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    
    console.log('درخواست سفارش دریافت شد:', formObject);

    // اگر کلمه "test-error" در یکی از فیلدها وجود داشت، خطا شبیه‌سازی می‌کنیم
    // این امکان را فراهم می‌کند که با وارد کردن این کلمه کلیدی در هر فیلد، خطا را تست کنیم
    for (const [key, value] of Object.entries(formObject)) {
      if (typeof value === 'string' && value.includes('test-error')) {
        // شبیه‌سازی خطای سرور
        return NextResponse.json({
          success: false,
          message: 'خطای آزمایشی: این خطا برای تست نمایش خطا ایجاد شده است',
          errorDetails: {
            field: key,
            status: 500,
            statusText: 'Internal Server Error (Test)',
            errorCode: 'TEST_ERROR'
          }
        }, { status: 500 });
      }
    }

    // ایجاد یک شناسه منحصر به فرد برای سفارش
    const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
    const createdAt = new Date().toISOString();
    
    // ایجاد یک شیء سفارش برای ذخیره‌سازی
    const order = {
      id: orderId,
      customerName: formObject.storeName || 'بدون نام',
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
      createdAt,
      details: formObject
    };

    // ارسال پاسخ موفقیت
    return NextResponse.json({
      success: true,
      message: 'سفارش شما با موفقیت ثبت شد',
      data: {
        id: orderId,
        createdAt,
        order
      }
    });
  } catch (error) {
    console.error('خطا در پردازش درخواست:', error);
    
    // ارسال پاسخ خطا
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.',
      errorDetails: {
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
} 