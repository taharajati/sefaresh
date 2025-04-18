const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// تنظیمات ذخیره‌سازی برای آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// تنظیم فیلتر فایل‌ها (فقط تصاویر)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری مجاز هستند!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // حداکثر 5 مگابایت
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// مسیر استاتیک برای نمایش تصاویر
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// افزودن نقطه پایانی برای چک کردن سلامت سرور
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// مسیر API برای ورود ادمین
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // بررسی اعتبارسنجی ساده
  if (username === 'shop_admin' && password === 'Sefaresh@1401') {
    // تولید یک توکن ساده (در یک محیط واقعی، باید از JWT یا راه حل امن‌تری استفاده شود)
    const token = 'admin_token_' + Date.now();
    
    res.json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      data: { token }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'نام کاربری یا رمز عبور اشتباه است'
    });
  }
});

// مسیر API برای ایجاد سفارش‌های نمونه (فقط برای تست)
app.get('/api/test/create-sample-orders', (req, res) => {
  // تعداد سفارش‌هایی که می‌خواهیم ایجاد کنیم
  const count = req.query.count ? parseInt(req.query.count) : 5;
  
  // آرایه‌ی وعده‌ها برای ذخیره‌ سفارش‌ها
  const orderPromises = [];
  
  // ایجاد سفارش‌های نمونه
  for (let i = 0; i < count; i++) {
    const customer = `مشتری نمونه ${i+1}`;
    const items = JSON.stringify([
      {
        name: `سفارش سایت ${['basic', 'standard', 'advanced'][i % 3]}`,
        quantity: 1,
        price: 10000000 + (i * 5000000)
      }
    ]);
    const total = 10000000 + (i * 5000000);
    const status = ['pending', 'confirmed', 'delivered', 'cancelled'][i % 4];
    
    const orderPromise = new Promise((resolve, reject) => {
      const sql = `INSERT INTO orders (customer, items, status, total) VALUES (?, ?, ?, ?)`;
      db.run(sql, [customer, items, status, total], function(err) {
        if (err) {
          console.error('Error creating sample order:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
    
    orderPromises.push(orderPromise);
  }
  
  // اجرای همه‌ی وعده‌ها
  Promise.all(orderPromises)
    .then(orderIds => {
      res.json({
        success: true,
        message: `${orderIds.length} سفارش نمونه با موفقیت ایجاد شد`,
        data: { orderIds }
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد سفارش‌های نمونه',
        error: error.message
      });
    });
});

// میدلور احراز هویت ساده
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // اگر هدر احراز هویت وجود ندارد یا با 'Bearer ' شروع نمی‌شود
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // برای ساده‌سازی آزمایش، اجازه می‌دهیم بدون احراز هویت هم درخواست‌ها پاسخ داده شوند
    console.warn('Authentication header missing or invalid, proceeding anyway');
    return next();
  }
  
  // استخراج توکن از هدر
  const token = authHeader.split(' ')[1];
  
  // در یک محیط واقعی، اینجا توکن بررسی و اطلاعات کاربر استخراج می‌شود
  // برای این مثال، فقط وجود توکن را چک می‌کنیم
  if (!token) {
    // برای ساده‌سازی آزمایش، اجازه می‌دهیم بدون احراز هویت هم درخواست‌ها پاسخ داده شوند
    console.warn('Token is empty, proceeding anyway');
    return next();
  }
  
  // در یک پیاده‌سازی واقعی، اینجا توکن را بررسی می‌کنیم
  // اما در این مثال، فقط اجازه می‌دهیم درخواست ادامه یابد
  console.log('Authentication successful with token:', token);
  next();
};

// اطمینان از وجود پوشه uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create orders table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      items TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ایجاد جدول محصولات اگر وجود ندارد
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image_path TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ایجاد جدول دسته‌بندی‌ها اگر وجود ندارد
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // ایجاد جدول تصاویر گالری اگر وجود ندارد
  db.run(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      image_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // ایجاد جدول تصاویر نمونه محصولات اگر وجود ندارد
  db.run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      title TEXT,
      description TEXT,
      category TEXT,
      image_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id)
    )
  `);
});

// مسیر API برای آپلود تصویر
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی آپلود نشد' });
    }
    
    // ارسال اطلاعات فایل آپلود شده
    res.status(201).json({ 
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API برای مدیریت تصاویر گالری
// دریافت همه تصاویر گالری
app.get('/api/gallery', (req, res) => {
  const sql = 'SELECT * FROM gallery_images ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// افزودن تصویر جدید به گالری
app.post('/api/gallery', upload.single('image'), (req, res) => {
  const { title, description, category } = req.body;
  
  if (!title || !req.file) {
    return res.status(400).json({ error: 'عنوان و تصویر الزامی هستند' });
  }
  
  const imagePath = `/uploads/${req.file.filename}`;
  
  const sql = `INSERT INTO gallery_images (title, description, category, image_path) VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, description, category, imagePath], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // دریافت تصویر تازه ایجاد شده
    db.get('SELECT * FROM gallery_images WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// حذف تصویر از گالری
app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  
  // ابتدا فایل تصویر را پیدا می‌کنیم
  db.get('SELECT image_path FROM gallery_images WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد' });
    }
    
    // حذف رکورد از دیتابیس
    db.run('DELETE FROM gallery_images WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد' });
      }
      
      // حذف فایل فیزیکی تصویر (اختیاری)
      const filePath = path.join(__dirname, row.image_path.replace('/uploads/', 'uploads/'));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
      
      res.json({ message: 'تصویر با موفقیت حذف شد' });
    });
  });
});

// بروزرسانی اطلاعات تصویر
app.put('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'عنوان تصویر الزامی است' });
  }
  
  const sql = `UPDATE gallery_images SET title = ?, description = ?, category = ? WHERE id = ?`;
  db.run(sql, [title, description, category, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد' });
    }
    
    db.get('SELECT * FROM gallery_images WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

// API Routes برای محصولات
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  
  let sql = 'SELECT * FROM products';
  let params = [];
  
  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }
    res.json(row);
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, description, price, category } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'نام و قیمت محصول الزامی است' });
  }
  
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  const sql = `INSERT INTO products (name, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [name, description, price, category, imagePath], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // دریافت محصول تازه ایجاد شده
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;
  
  // ابتدا اطلاعات فعلی محصول را دریافت می‌کنیم
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }
    
    // تعیین مسیر تصویر (اگر تصویر جدید آپلود شده، از آن استفاده می‌کنیم)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : product.image_path;
    
    const sql = `UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_path = ? WHERE id = ?`;
    db.run(sql, [
      name || product.name,
      description || product.description,
      price || product.price,
      category !== undefined ? category : product.category,
      imagePath,
      id
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'محصول یافت نشد' });
      }
      
      // دریافت اطلاعات به‌روز شده محصول
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  // ابتدا اطلاعات محصول را دریافت می‌کنیم تا مسیر تصویر را بگیریم
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }
    
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'محصول یافت نشد' });
      }
      
      // حذف فایل تصویر از سرور اگر وجود داشته باشد
      if (product.image_path) {
        const imagePath = path.join(__dirname, product.image_path.replace(/^\/uploads/, 'uploads'));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.status(200).json({ message: 'محصول با موفقیت حذف شد' });
    });
  });
});

// مسیر API برای دریافت تصاویر نمونه محصولات
app.get('/api/product-images', (req, res) => {
  const sql = 'SELECT * FROM product_images ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// مسیر API برای دریافت تصاویر نمونه محصولات یک سفارش
app.get('/api/orders/:id/product-images', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM product_images WHERE order_id = ? ORDER BY created_at DESC';
  db.all(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API Routes برای سفارش‌ها
app.get('/api/orders', authenticate, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: err.message,
        data: null
      });
    }
    
    // Parse the items JSON string for each order
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    
    res.json({
      success: true,
      message: `${orders.length} سفارش یافت شد`,
      data: orders
    });
  });
});

// مسیر API برای دریافت یک سفارش با شناسه خاص
app.get('/api/orders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ 
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      });
    }
    
    // Parse the items JSON string
    const order = {
      ...row,
      items: JSON.parse(row.items)
    };
    
    // دریافت تصاویر نمونه محصولات مرتبط با این سفارش
    db.all('SELECT * FROM product_images WHERE order_id = ? ORDER BY created_at DESC', [id], (err, images) => {
      if (err) {
        // اگر خطایی در دریافت تصاویر وجود داشت، سفارش بدون تصاویر برگردانده می‌شود
        console.error('Error getting product images:', err);
        return res.json({
          success: true,
          message: 'سفارش با موفقیت دریافت شد، اما خطایی در دریافت تصاویر وجود داشت',
          data: order
        });
      }
      
      order.productImages = images;
      return res.json({
        success: true,
        message: 'سفارش با موفقیت دریافت شد',
        data: order
      });
    });
  });
});

app.post('/api/orders', upload.array('productImage', 10), (req, res) => {
  const { customer, items, total } = req.body;
  
  if (!customer || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const itemsJson = JSON.stringify(items);
  
  const sql = `INSERT INTO orders (customer, items, total) VALUES (?, ?, ?)`;
  db.run(sql, [customer, itemsJson, total], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const orderId = this.lastID;
    
    // ذخیره تصاویر نمونه محصولات
    const productImagesCount = parseInt(req.body.productImagesCount || '0', 10);
    const productImagePromises = [];
    
    for (let i = 0; i < productImagesCount; i++) {
      if (req.files && req.files[i]) {
        const file = req.files[i];
        const title = req.body[`productImageTitle_${i}`] || '';
        const description = req.body[`productImageDescription_${i}`] || '';
        const category = req.body[`productImageCategory_${i}`] || '';
        const imagePath = `/uploads/${file.filename}`;
        
        const insertImagePromise = new Promise((resolve, reject) => {
          const imageSql = `INSERT INTO product_images (order_id, title, description, category, image_path) VALUES (?, ?, ?, ?, ?)`;
          db.run(imageSql, [orderId, title, description, category, imagePath], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          });
        });
        
        productImagePromises.push(insertImagePromise);
      }
    }
    
    // Get the newly created order
    Promise.all(productImagePromises)
      .then(() => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Parse the items JSON string
          const order = {
            ...row,
            items: JSON.parse(row.items)
          };
          
          // تصاویر نمونه محصولات را نیز دریافت کنید
          db.all('SELECT * FROM product_images WHERE order_id = ?', [orderId], (err, images) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            order.productImages = images;
            res.status(201).json(order);
          });
        });
      })
      .catch(error => {
        console.error('Error saving product images:', error);
        res.status(201).json({ id: orderId, message: 'Order created but had errors saving images' });
      });
  });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get the updated order
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Parse the items JSON string
      const order = {
        ...row,
        items: JSON.parse(row.items)
      };
      
      res.json(order);
    });
  });
});

// API Routes برای دسته‌بندی‌ها
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'نام دسته‌بندی الزامی است' });
  }
  
  const sql = `INSERT INTO categories (name, description) VALUES (?, ?)`;
  db.run(sql, [name, description], function(err) {
    if (err) {
      // اگر دسته‌بندی تکراری باشد
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'این دسته‌بندی قبلاً ثبت شده است' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    // دریافت دسته‌بندی تازه ایجاد شده
    db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'نام دسته‌بندی الزامی است' });
  }
  
  const sql = `UPDATE categories SET name = ?, description = ? WHERE id = ?`;
  db.run(sql, [name, description, id], function(err) {
    if (err) {
      // اگر دسته‌بندی تکراری باشد
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'این دسته‌بندی قبلاً ثبت شده است' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'دسته‌بندی یافت نشد' });
    }
    
    // دریافت اطلاعات به‌روز شده دسته‌بندی
    db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  
  // ابتدا بررسی می‌کنیم آیا محصولی با این دسته‌بندی وجود دارد
  db.get('SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ 
        error: 'این دسته‌بندی در محصولات استفاده شده است و نمی‌توان آن را حذف کرد',
        count: result.count
      });
    }
    
    // اگر دسته‌بندی در هیچ محصولی استفاده نشده، آن را حذف می‌کنیم
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'دسته‌بندی یافت نشد' });
      }
      
      res.status(200).json({ message: 'دسته‌بندی با موفقیت حذف شد' });
    });
  });
});

// مسیر API برای حذف تصویر نمونه محصول
app.delete('/api/product-images/:id', (req, res) => {
  const { id } = req.params;
  
  // ابتدا فایل تصویر را پیدا می‌کنیم
  db.get('SELECT image_path FROM product_images WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد' });
    }
    
    // حذف رکورد از دیتابیس
    db.run('DELETE FROM product_images WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد' });
      }
      
      // حذف فایل فیزیکی تصویر (اختیاری)
      const filePath = path.join(__dirname, row.image_path.replace('/uploads/', 'uploads/'));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
      
      res.json({ message: 'تصویر با موفقیت حذف شد' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 