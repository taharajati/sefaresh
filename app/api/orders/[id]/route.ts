import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '../../../../database/sqlite';

// GET handler - get a single order by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Processing GET /api/orders/${params.id} request`);
    
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the order directly from SQLite
    const order = getOrderById(params.id);
    
    if (order) {
      console.log(`Retrieved order ${params.id} from database`);
      return NextResponse.json({
        success: true,
        message: 'سفارش یافت شد',
        data: order
      });
    } else {
      console.log(`Order ${params.id} not found in database`);
      return NextResponse.json({
        success: false,
        message: 'سفارش یافت نشد',
        data: null
      }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error in GET /api/orders/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: `خطا در دریافت سفارش: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PATCH handler - update order status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Processing PATCH /api/orders/${params.id} request`);
    
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the updated status from the request body
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json(
        { success: false, message: 'وضعیت جدید سفارش مشخص نشده است' },
        { status: 400 }
      );
    }
    
    // Update the order status directly in SQLite
    const result = updateOrderStatus(params.id, status);
    
    if (result) {
      console.log(`Successfully updated order ${params.id} status to ${status}`);
      return NextResponse.json({
        success: true,
        message: 'وضعیت سفارش بروزرسانی شد',
        data: { id: params.id, status }
      });
    } else {
      console.error(`Failed to update order ${params.id} status to ${status}`);
      return NextResponse.json({
        success: false,
        message: 'خطا در بروزرسانی وضعیت سفارش',
        data: null
      }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error in PATCH /api/orders/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: `خطا در بروزرسانی وضعیت سفارش: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 