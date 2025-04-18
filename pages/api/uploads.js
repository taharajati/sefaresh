import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import dbUtils from '../../database/db';

// تعریف بایت‌های اولیه فایل تصویری
const imageFileSignatures = {
  jpeg: Buffer.from([0xFF, 0xD8, 0xFF]),
  png: Buffer.from([0x89, 0x50, 0x4E, 0x47]),
  gif: Buffer.from([0x47, 0x49, 0x46, 0x38])
};

// بررسی فایل برای اطمینان از اینکه تصویر است
const isImageFile = (buffer) => {
  return (
    buffer.indexOf(imageFileSignatures.jpeg) === 0 ||
    buffer.indexOf(imageFileSignatures.png) === 0 ||
    buffer.indexOf(imageFileSignatures.gif) === 0
  );
};

// تنظیمات ذخیره‌سازی فایل‌ها با multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // ایجاد پوشه اگر وجود نداشته باشد
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ساخت نام فایل منحصر به فرد با uuid
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// فیلتر کردن فایل‌ها، فقط تصاویر پذیرفته می‌شوند
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // محدودیت 5 مگابایت
  }
});

// تنظیم multer برای express middleware
export const config = {
  api: {
    bodyParser: false
  }
};

// تبدیل middleware multer به promise
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// پردازش آپلود چند فایل
const uploadMiddleware = upload.array('images', 5); // حداکثر 5 فایل

// handler اصلی API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // اجرای middleware آپلود
    await runMiddleware(req, res, uploadMiddleware);

    // دریافت اطلاعات از body
    const { orderId, type } = req.body;

    if (!orderId || !type) {
      return res.status(400).json({ error: 'orderId and type are required' });
    }

    // پردازش فایل‌های آپلود شده
    const savedImages = [];
    for (const file of req.files) {
      // ذخیره اطلاعات فایل در دیتابیس
      const imageData = {
        order_id: orderId,
        type,
        file_path: `/uploads/${file.filename}`,
        file_name: file.filename,
        original_name: file.originalname
      };

      const result = dbUtils.saveImage(imageData);

      if (result.success) {
        savedImages.push({
          id: result.id,
          ...imageData
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `${savedImages.length} image(s) uploaded successfully`,
      images: savedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
} 