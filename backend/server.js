const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
});

// API Routes
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 