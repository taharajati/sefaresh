import { NextRequest, NextResponse } from 'next/server';
import { saveOrder, getAllOrders, countOrders } from '../../../database/sqlite';

// GET handler - retrieve all orders
export async function GET(request: NextRequest) {
  try {
    // Check for authentication (can be improved)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Processing GET /api/orders request');
    
    // Get all orders directly from SQLite
    const orders = getAllOrders();
    const count = countOrders();
    
    console.log(`Retrieved ${orders.length} orders from database (total count: ${count})`);
    
    return NextResponse.json({
      success: true,
      message: `${orders.length} سفارش یافت شد`,
      data: orders
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, message: `خطا در دریافت سفارش‌ها: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST handler - create a new order
export async function POST(request: NextRequest) {
  try {
    console.log('Processing POST /api/orders request');
    const formData = await request.formData();
    
    // Log the received data for debugging
    console.log('Received form data with fields:', Array.from(formData.keys()));
    
    // Convert FormData to a regular object
    const formObject: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      formObject[key] = value;
    }
    
    // Try to parse additionalModules if provided
    if (formObject.additionalModules && typeof formObject.additionalModules === 'string') {
      try {
        formObject.additionalModules = JSON.parse(formObject.additionalModules);
      } catch (e) {
        console.error('Error parsing additionalModules:', e);
      }
    }
    
    // Create a unique ID for the order
    const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
    const createdAt = new Date().toISOString();
    
    // Create an order object
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
      additionalModules: formObject.additionalModules || [],
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
    
    // Save the order directly to SQLite
    const result = saveOrder(order);
    
    if (result) {
      console.log(`Order ${order.id} successfully saved to database`);
      return NextResponse.json({
        success: true,
        message: 'سفارش شما با موفقیت ثبت شد',
        data: order
      });
    } else {
      console.error(`Failed to save order ${order.id} to database`);
      return NextResponse.json({
        success: false,
        message: 'خطا در ثبت سفارش',
        data: null
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `خطا در ثبت سفارش: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 