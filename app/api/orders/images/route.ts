import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dbUtils from '../../../../database/db';

// بررسی امضای فایل برای تصاویر
const imageSignatures = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38]
};

// بررسی آیا فایل یک تصویر است
async function isImage(buffer: Buffer): Promise<boolean> {
  // بررسی امضای JPEG
  if (buffer[0] === imageSignatures.jpeg[0] &&
      buffer[1] === imageSignatures.jpeg[1] &&
      buffer[2] === imageSignatures.jpeg[2]) {
    return true;
  }
  
  // بررسی امضای PNG
  if (buffer[0] === imageSignatures.png[0] &&
      buffer[1] === imageSignatures.png[1] &&
      buffer[2] === imageSignatures.png[2] &&
      buffer[3] === imageSignatures.png[3]) {
    return true;
  }
  
  // بررسی امضای GIF
  if (buffer[0] === imageSignatures.gif[0] &&
      buffer[1] === imageSignatures.gif[1] &&
      buffer[2] === imageSignatures.gif[2] &&
      buffer[3] === imageSignatures.gif[3]) {
    return true;
  }
  
  return false;
}

// پردازش درخواست آپلود تصویر
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const orderId = formData.get('orderId') as string | null;
    
    // بررسی وجود فایل و شناسه سفارش
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // بررسی وجود سفارش
    const order = await dbUtils.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // تبدیل فایل به بافر برای بررسی نوع آن
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // بررسی آیا فایل یک تصویر است
    if (!(await isImage(buffer))) {
      return NextResponse.json(
        { error: 'Uploaded file is not a valid image' },
        { status: 400 }
      );
    }
    
    // ایجاد نام یکتا برای فایل
    const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
    
    // مسیر دایرکتوری آپلود
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // اطمینان از وجود دایرکتوری آپلود
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    // مسیر کامل فایل
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // ذخیره فایل در سیستم فایل
    await writeFile(filePath, buffer);
    
    // ذخیره اطلاعات تصویر در دیتابیس
    const imageResult = await dbUtils.saveImage({
      order_id: orderId,
      filename: uniqueFilename,
      original_name: file.name,
      file_path: `/uploads/${uniqueFilename}`,
      file_type: file.type
    });
    
    if (!imageResult.success) {
      return NextResponse.json(
        { error: 'Failed to save image information' },
        { status: 500 }
      );
    }
    
    // پاسخ موفقیت‌آمیز
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: imageResult.id,
        filename: uniqueFilename,
        url: `/uploads/${uniqueFilename}`
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// دریافت تصاویر مربوط به یک سفارش
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // بررسی وجود سفارش
    const order = await dbUtils.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // دریافت تصاویر مربوط به سفارش
    const images = await dbUtils.getImagesByOrderId(orderId);
    
    return NextResponse.json(images);
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 