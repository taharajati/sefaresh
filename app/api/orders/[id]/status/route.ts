import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatusInDb } from '../../../../../database/db-helper';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for authentication (can be improved)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const data = await request.json();
    
    // Verify status is provided
    if (!data.status) {
      return NextResponse.json(
        { success: false, message: 'وضعیت سفارش الزامی است' },
        { status: 400 }
      );
    }
    
    // Update status in SQLite using the server-only helper
    const result = await updateOrderStatusInDb(orderId, data.status);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating order status:`, error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی وضعیت سفارش' },
      { status: 500 }
    );
  }
} 