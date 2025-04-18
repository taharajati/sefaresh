import { NextRequest, NextResponse } from 'next/server';
import dbUtils from '../../../database/db';

// دریافت همه سفارش‌ها یا یک سفارش خاص
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    
    if (id) {
      // دریافت یک سفارش با شناسه
      const order = await dbUtils.getOrderById(id);
      
      if (!order) {
        return NextResponse.json(
          { message: 'Order not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(order);
    } else {
      // دریافت همه سفارش‌ها
      const orders = await dbUtils.getAllOrders();
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// ایجاد سفارش جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, status, total, branding } = body;

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // ذخیره سفارش جدید
    const result = await dbUtils.saveOrder({
      customer_name: customerName,
      status: status || 'pending',
      total: total || 0
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      );
    }
    
    // ذخیره اطلاعات برندینگ اگر ارائه شده باشند
    if (branding) {
      const brandingResult = await dbUtils.saveBranding({
        order_id: result.id,
        favorite_color: branding.favoriteColor || '',
        preferred_font: branding.preferredFont || '',
        brand_slogan: branding.brandSlogan || '',
        logo_url: branding.logoUrl || ''
      });
      
      if (!brandingResult.success) {
        console.error('Failed to save branding information');
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        orderId: result.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// بروزرسانی وضعیت سفارش
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const body = await request.json();
    const { status } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // بروزرسانی وضعیت سفارش
    const result = await dbUtils.updateOrderStatus(id, status);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Order not found or update failed' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 