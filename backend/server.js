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

// API Routes برای سفارش‌ها
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse the items JSON string for each order
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
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
    
    // Get the newly created order
    db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Parse the items JSON string
      const order = {
        ...row,
        items: JSON.parse(row.items)
      };
      
      res.status(201).json(order);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 