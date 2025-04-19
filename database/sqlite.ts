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
  
  // Define database path - use absolute path for reliability
  const DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), 'database/orders.db');
  console.log('Using SQLite database path:', DB_PATH);

  // Make sure the database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    console.log('Creating database directory:', dbDir);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Log database file permissions before connecting
  try {
    const stats = fs.statSync(DB_PATH);
    console.log('Database file exists, permissions:', stats.mode.toString(8));
  } catch (err) {
    console.log('Database file does not exist yet, will be created');
  }
  
  // Connect to the database with options for better reliability
  db = new Database(DB_PATH, { 
    verbose: console.log,
    fileMustExist: false,
    timeout: 5000
  }) as SqliteDatabase;
  
  console.log('Connected to SQLite database at', DB_PATH);
  
  // Create orders table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Test writing to the database
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO orders (id, data) VALUES (?, ?)');
    const testResult = stmt.run('TEST-ID', JSON.stringify({ test: 'data' }));
    console.log('Test write to SQLite successful:', testResult);
    isSqliteAvailable = true;
  } catch (testError) {
    console.error('Failed to write test data to SQLite:', testError);
    throw testError; // Rethrow to trigger the catch block below
  }
  
  console.log('Orders table initialized');
  isSqliteAvailable = true;
} catch (error) {
  console.error('SQLite initialization failed:', error);
  throw new Error('SQLite initialization failed: ' + error.message);
}

// Save an order to the database
export function saveOrder(order: any): boolean {
  if (!isSqliteAvailable || !db) {
    throw new Error('SQLite database is not available');
  }
  
  try {
    console.log(`Saving order ${order.id} to SQLite database`);
    const stmt = db.prepare('INSERT OR REPLACE INTO orders (id, data) VALUES (?, ?)');
    const result = stmt.run(order.id, JSON.stringify(order));
    console.log(`Order ${order.id} saved to SQLite database:`, result);
    return true;
  } catch (error) {
    console.error('Error saving order to SQLite database:', error);
    throw error; // Rethrow to make the error visible
  }
}

// Get all orders from the database
export function getAllOrders(): any[] {
  if (!isSqliteAvailable || !db) {
    throw new Error('SQLite database is not available');
  }
  
  try {
    console.log('Retrieving all orders from SQLite database');
    const stmt = db.prepare<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
    const rows = stmt.all();
    
    console.log(`Retrieved ${rows.length} orders from SQLite database`);
    
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
    throw error; // Rethrow to make the error visible
  }
}

// Get a single order by ID
export function getOrderById(id: string): any | null {
  if (!isSqliteAvailable || !db) {
    throw new Error('SQLite database is not available');
  }
  
  try {
    console.log(`Retrieving order ${id} from SQLite database`);
    const stmt = db.prepare<OrderRow>('SELECT data FROM orders WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) {
      console.log(`Order ${id} not found in SQLite database`);
      return null;
    }
    
    try {
      return JSON.parse(row.data);
    } catch (error) {
      console.error('Error parsing order data:', error);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching order ${id} from SQLite database:`, error);
    throw error; // Rethrow to make the error visible
  }
}

// Update order status
export function updateOrderStatus(id: string, status: string): boolean {
  if (!isSqliteAvailable || !db) {
    throw new Error('SQLite database is not available');
  }
  
  try {
    console.log(`Updating order ${id} status to ${status} in SQLite database`);
    const stmt = db.prepare<OrderRow>('SELECT data FROM orders WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) {
      console.log(`Order ${id} not found in SQLite database`);
      return false;
    }
    
    try {
      const order = JSON.parse(row.data);
      order.status = status;
      
      const updateStmt = db.prepare('UPDATE orders SET data = ? WHERE id = ?');
      const result = updateStmt.run(JSON.stringify(order), id);
      
      console.log(`Order ${id} status updated to ${status} in SQLite database:`, result);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Rethrow to make the error visible
    }
  } catch (error) {
    console.error(`Error updating order ${id} in SQLite database:`, error);
    throw error; // Rethrow to make the error visible
  }
}

// Count orders in the database
export function countOrders(): number {
  if (!isSqliteAvailable || !db) {
    throw new Error('SQLite database is not available');
  }
  
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM orders');
    const result = stmt.get();
    return result?.count || 0;
  } catch (error) {
    console.error('Error counting orders in SQLite database:', error);
    throw error; // Rethrow to make the error visible
  }
}

export default {
  saveOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  countOrders
}; 