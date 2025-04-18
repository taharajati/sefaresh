const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// اطمینان از وجود پوشه دیتابیس
const dbDirectory = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// مسیر فایل دیتابیس
const dbPath = path.join(dbDirectory, 'sefaresh.db');

// ایجاد اتصال به دیتابیس
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// ایجاد جداول مورد نیاز
function initializeDatabase() {
  db.serialize(() => {
    // جدول سفارش‌ها
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // جدول برندینگ
    db.run(`CREATE TABLE IF NOT EXISTS branding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      favorite_color TEXT,
      preferred_font TEXT,
      brand_slogan TEXT,
      logo_url TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id)
    )`);

    // جدول تصاویر
    db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      size INTEGER,
      mimetype TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// تابع‌های مدیریت سفارش‌ها
const dbUtils = {
  // دریافت همه سفارش‌ها
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          console.error('Error fetching orders:', err.message);
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  },

  // دریافت یک سفارش با شناسه
  getOrderById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
        if (err) {
          console.error('Error fetching order:', err.message);
          reject(err);
          return;
        }
        
        if (!order) {
          resolve(null);
          return;
        }
        
        // دریافت اطلاعات برندینگ سفارش
        db.get('SELECT * FROM branding WHERE order_id = ?', [id], (err, branding) => {
          if (err) {
            console.error('Error fetching branding:', err.message);
            // در صورت خطا در دریافت برندینگ، سفارش بدون برندینگ برگردانده می‌شود
            resolve(order);
            return;
          }
          
          // ترکیب اطلاعات سفارش و برندینگ
          resolve({
            ...order,
            branding: branding || null
          });
        });
      });
    });
  },

  // ذخیره سفارش جدید
  saveOrder: (orderData) => {
    return new Promise((resolve, reject) => {
      const { customer_name, status, total } = orderData;
      
      db.run(
        'INSERT INTO orders (customer_name, status, total) VALUES (?, ?, ?)',
        [customer_name, status, total],
        function(err) {
          if (err) {
            console.error('Error saving order:', err.message);
            resolve({ success: false, error: err.message });
            return;
          }
          
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  },

  // ذخیره اطلاعات برندینگ
  saveBranding: (brandingData) => {
    return new Promise((resolve, reject) => {
      const { order_id, favorite_color, preferred_font, brand_slogan, logo_url } = brandingData;
      
      db.run(
        'INSERT INTO branding (order_id, favorite_color, preferred_font, brand_slogan, logo_url) VALUES (?, ?, ?, ?, ?)',
        [order_id, favorite_color, preferred_font, brand_slogan, logo_url],
        function(err) {
          if (err) {
            console.error('Error saving branding:', err.message);
            resolve({ success: false, error: err.message });
            return;
          }
          
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  },

  // بروزرسانی وضعیت سفارش
  updateOrderStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) {
            console.error('Error updating order status:', err.message);
            resolve({ success: false, error: err.message });
            return;
          }
          
          if (this.changes === 0) {
            resolve({ success: false, error: 'Order not found' });
            return;
          }
          
          resolve({ success: true });
        }
      );
    });
  },

  // ذخیره اطلاعات تصویر
  saveImage: (imageData) => {
    return new Promise((resolve, reject) => {
      const { original_name, filename, filepath, size, mimetype } = imageData;
      
      db.run(
        'INSERT INTO images (original_name, filename, filepath, size, mimetype) VALUES (?, ?, ?, ?, ?)',
        [original_name, filename, filepath, size, mimetype],
        function(err) {
          if (err) {
            console.error('Error saving image:', err.message);
            resolve({ success: false, error: err.message });
            return;
          }
          
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  },

  // دریافت اطلاعات تصویر با شناسه
  getImageById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM images WHERE id = ?', [id], (err, image) => {
        if (err) {
          console.error('Error fetching image:', err.message);
          reject(err);
          return;
        }
        
        resolve(image);
      });
    });
  },

  // دریافت همه تصاویر
  getAllImages: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM images ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          console.error('Error fetching images:', err.message);
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }
};

// بستن اتصال به دیتابیس در هنگام خروج
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database connection:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = dbUtils; 