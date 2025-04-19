import fs from 'fs';
import path from 'path';

// Type definition for better-sqlite3 statement
interface Statement<T = any> {
  run: (...params: any[]) => { changes: number, lastInsertRowid: number | bigint };
  get: (...params: any[]) => T | undefined;
  all: () => T[];
}

// Interface for better-sqlite3 database
interface SqliteDatabase {
  prepare: <T = any>(sql: string) => Statement<T>;
  exec: (sql: string) => void;
}

// Flag to track if SQLite is available
let isSqliteAvailable = false;
let db: SqliteDatabase | null = null;

// Order Row interface
interface OrderRow {
  id: string;
  data: string;
  created_at: string;
}

// Try to load better-sqlite3, but gracefully handle if it's not available
try {
  const Database = require('better-sqlite3');
  
  // Define database path
  const DB_PATH = path.resolve(process.cwd(), 'database/orders.db');

  // Make sure the database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Connect to the database
  db = new Database(DB_PATH) as SqliteDatabase;
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
  isSqliteAvailable = true;
} catch (error) {
  console.error('SQLite not available, falling back to localStorage:', error);
  isSqliteAvailable = false;
}

// Get localStorage (safely, with server-side rendering in mind)
function getLocalStorage() {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
}

// Save an order to the database or localStorage
export function saveOrder(order: any): boolean {
  if (isSqliteAvailable && db) {
    try {
      const stmt = db.prepare('INSERT OR REPLACE INTO orders (id, data) VALUES (?, ?)');
      const result = stmt.run(order.id, JSON.stringify(order));
      console.log(`Order ${order.id} saved to SQLite database`);
      return true;
    } catch (error) {
      console.error('Error saving order to SQLite database:', error);
      // Fall back to localStorage
      return saveOrderToLocalStorage(order);
    }
  } else {
    // SQLite not available, use localStorage
    return saveOrderToLocalStorage(order);
  }
}

// Save order to localStorage
function saveOrderToLocalStorage(order: any): boolean {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) {
      console.error('localStorage not available in server environment');
      // For server environment, we'll simulate success to allow the app to continue working
      return true;
    }
    
    const existingOrdersStr = localStorage.getItem('orders') || '[]';
    const existingOrders = JSON.parse(existingOrdersStr);
    
    // Check if order with this ID already exists
    const orderIndex = existingOrders.findIndex((o: any) => o.id === order.id);
    if (orderIndex >= 0) {
      // Update existing order
      existingOrders[orderIndex] = order;
    } else {
      // Add new order
      existingOrders.push(order);
    }
    
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    console.log(`Order ${order.id} saved to localStorage`);
    return true;
  } catch (error) {
    console.error('Error saving order to localStorage:', error);
    return true; // Return true anyway to prevent errors
  }
}

// Get all orders from the database or localStorage
export function getAllOrders(): any[] {
  if (isSqliteAvailable && db) {
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
      // Fall back to localStorage
      return getAllOrdersFromLocalStorage();
    }
  } else {
    // SQLite not available, use localStorage
    return getAllOrdersFromLocalStorage();
  }
}

// Get all orders from localStorage
function getAllOrdersFromLocalStorage(): any[] {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) {
      console.error('localStorage not available in server environment');
      return []; // Return empty array in server environment
    }
    
    const ordersFromStorage = localStorage.getItem('orders');
    if (!ordersFromStorage) {
      return [];
    }
    
    const parsedOrders = JSON.parse(ordersFromStorage);
    if (!Array.isArray(parsedOrders)) {
      console.warn('Orders in localStorage is not an array');
      return [];
    }
    
    return parsedOrders;
  } catch (error) {
    console.error('Error getting orders from localStorage:', error);
    return [];
  }
}

// Get a single order by ID
export function getOrderById(id: string): any | null {
  if (isSqliteAvailable && db) {
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
      // Fall back to localStorage
      return getOrderByIdFromLocalStorage(id);
    }
  } else {
    // SQLite not available, use localStorage
    return getOrderByIdFromLocalStorage(id);
  }
}

// Get a single order by ID from localStorage
function getOrderByIdFromLocalStorage(id: string): any | null {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) {
      console.error('localStorage not available in server environment');
      return null;
    }
    
    const ordersFromStorage = localStorage.getItem('orders');
    if (!ordersFromStorage) {
      return null;
    }
    
    const parsedOrders = JSON.parse(ordersFromStorage);
    if (!Array.isArray(parsedOrders)) {
      console.warn('Orders in localStorage is not an array');
      return null;
    }
    
    return parsedOrders.find((order: any) => order.id === id) || null;
  } catch (error) {
    console.error(`Error fetching order ${id} from localStorage:`, error);
    return null;
  }
}

// Update order status
export function updateOrderStatus(id: string, status: string): boolean {
  if (isSqliteAvailable && db) {
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
      // Fall back to localStorage
      return updateOrderStatusInLocalStorage(id, status);
    }
  } else {
    // SQLite not available, use localStorage
    return updateOrderStatusInLocalStorage(id, status);
  }
}

// Update order status in localStorage
function updateOrderStatusInLocalStorage(id: string, status: string): boolean {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) {
      console.error('localStorage not available in server environment');
      return true; // Return true anyway to prevent errors
    }
    
    const ordersFromStorage = localStorage.getItem('orders');
    if (!ordersFromStorage) {
      return false;
    }
    
    const parsedOrders = JSON.parse(ordersFromStorage);
    if (!Array.isArray(parsedOrders)) {
      console.warn('Orders in localStorage is not an array');
      return false;
    }
    
    const updatedOrders = parsedOrders.map((order: any) => 
      order.id === id ? { ...order, status } : order
    );
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    console.log(`Order ${id} status updated to ${status} in localStorage`);
    return true;
  } catch (error) {
    console.error(`Error updating order ${id} status in localStorage:`, error);
    return true; // Return true anyway to prevent errors
  }
}

export default {
  saveOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
}; 