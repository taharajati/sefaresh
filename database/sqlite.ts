import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Define database path
const DB_PATH = path.resolve(process.cwd(), 'database/orders.db');

// Initialize database connection
let db: Database.Database;

try {
  // Make sure the database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Connect to the database
  db = new Database(DB_PATH);
  console.log('Connected to SQLite database at', DB_PATH);
  
  // Create orders table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Orders table initialized');
} catch (error) {
  console.error('Failed to connect to SQLite database:', error);
  throw error;
}

interface OrderRow {
  id: string;
  data: string;
  created_at: string;
}

// Save an order to the database
export function saveOrder(order: any): boolean {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO orders (id, data) VALUES (?, ?)');
    const result = stmt.run(order.id, JSON.stringify(order));
    console.log(`Order ${order.id} saved to SQLite database`);
    return true;
  } catch (error) {
    console.error('Error saving order to SQLite database:', error);
    return false;
  }
}

// Get all orders from the database
export function getAllOrders(): any[] {
  try {
    const stmt = db.prepare<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
    const rows = stmt.all();
    
    return rows.map((row: OrderRow) => {
      try {
        return JSON.parse(row.data);
      } catch (error) {
        console.error('Error parsing order data:', error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching orders from SQLite database:', error);
    return [];
  }
}

// Get a single order by ID
export function getOrderById(id: string): any | null {
  try {
    const stmt = db.prepare<OrderRow>('SELECT data FROM orders WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) return null;
    
    try {
      return JSON.parse(row.data);
    } catch (error) {
      console.error('Error parsing order data:', error);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching order ${id} from SQLite database:`, error);
    return null;
  }
}

// Update order status
export function updateOrderStatus(id: string, status: string): boolean {
  try {
    const stmt = db.prepare<OrderRow>('SELECT data FROM orders WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) return false;
    
    try {
      const order = JSON.parse(row.data);
      order.status = status;
      
      const updateStmt = db.prepare('UPDATE orders SET data = ? WHERE id = ?');
      updateStmt.run(JSON.stringify(order), id);
      
      console.log(`Order ${id} status updated to ${status} in SQLite database`);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  } catch (error) {
    console.error(`Error updating order ${id} in SQLite database:`, error);
    return false;
  }
}

export default {
  saveOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
}; 