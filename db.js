// db.js — SQLite database setup using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'hrg_inventory.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ═══════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materials (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    category  TEXT NOT NULL DEFAULT 'Other',
    unit      TEXT NOT NULL DEFAULT 'Pieces',
    qty       REAL NOT NULL DEFAULT 0,
    min_qty   REAL NOT NULL DEFAULT 50,
    rate      REAL NOT NULL DEFAULT 0,
    supplier  TEXT DEFAULT '',
    notes     TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    contact    TEXT DEFAULT '',
    phone      TEXT DEFAULT '',
    category   TEXT DEFAULT '',
    rating     INTEGER DEFAULT 3,
    lead_days  INTEGER DEFAULT 5,
    notes      TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL CHECK(type IN ('Stock In','Stock Out')),
    mat_id     INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    qty        REAL NOT NULL,
    details    TEXT DEFAULT '',
    project    TEXT DEFAULT '',
    date       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ═══════════════════════════════════════
// SEED DATA (only if tables are empty)
// ═══════════════════════════════════════
const bcrypt = require('bcryptjs');

function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) return; // Already seeded

  console.log('[DB] Seeding initial data...');

  // Default users
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  db.prepare(`INSERT INTO users (username, password, role) VALUES (?,?,?)`).run('admin', hash('admin123'), 'admin');
  db.prepare(`INSERT INTO users (username, password, role) VALUES (?,?,?)`).run('manager', hash('hrg2024'), 'manager');
  db.prepare(`INSERT INTO users (username, password, role) VALUES (?,?,?)`).run('staff', hash('staff123'), 'staff');

  // Materials
  const matStmt = db.prepare(`INSERT INTO materials (name,category,unit,qty,min_qty,rate,supplier) VALUES (?,?,?,?,?,?,?)`);
  const mats = [
    ['Cement (OPC 43)', 'Binding', 'Bags', 320, 100, 380, 'Birla Cement Ltd.'],
    ['River Sand (M-Sand)', 'Aggregate', 'Cubic Meter', 45, 20, 1800, 'Rajasthan Aggregates'],
    ['Coarse Aggregate 20mm', 'Aggregate', 'Cubic Meter', 38, 15, 1400, 'Rajasthan Aggregates'],
    ['TMT Steel Bars Fe500', 'Steel', 'MT', 8.5, 3, 58000, 'Tata Steel'],
    ['Concrete Blocks 6"', 'Masonry', 'Pieces', 1200, 500, 42, 'Local Kiln'],
    ['Red Bricks', 'Masonry', 'Pieces', 4800, 1000, 8, 'Local Kiln'],
    ['Gravel / Gitti', 'Aggregate', 'Cubic Meter', 22, 10, 900, 'Raj Aggregates'],
    ['PVC Pipes 4"', 'Plumbing', 'Pieces', 85, 30, 320, 'Supreme Industries'],
    ['Electrical Wire 2.5mm', 'Electrical', 'Meters', 600, 200, 45, 'Polycab'],
    ['White Cement', 'Binding', 'Bags', 28, 20, 520, 'Birla Cement Ltd.'],
    ['Binding Wire', 'Steel', 'Kg', 95, 30, 85, 'Tata Steel'],
    ['Ceramic Tiles 2x2', 'Finishing', 'Pieces', 420, 100, 65, 'Kajaria Tiles'],
  ];
  for (const m of mats) matStmt.run(...m);

  // Suppliers
  const supStmt = db.prepare(`INSERT INTO suppliers (name,contact,phone,category,rating,lead_days,notes) VALUES (?,?,?,?,?,?,?)`);
  supStmt.run('Birla Cement Ltd.', 'Rajiv Sharma', '9876543210', 'Binding', 5, 3, 'Premium supplier, consistent quality');
  supStmt.run('Rajasthan Aggregates', 'Suresh Patel', '9988776655', 'Aggregate', 4, 2, 'Local supplier, good pricing');
  supStmt.run('Tata Steel', 'Pradeep Kumar', '9871234567', 'Steel', 5, 7, 'Certified TMT rods, ISI marked');
  supStmt.run('Local Kiln', 'Ramji Lal', '9812345678', 'Masonry', 3, 1, 'Good for bulk orders');
  supStmt.run('Supreme Industries', 'Ankit Jain', '9900112233', 'Plumbing', 4, 4, 'ISI certified PVC products');

  // Transactions
  const txnStmt = db.prepare(`INSERT INTO transactions (type,mat_id,qty,details,project,date) VALUES (?,?,?,?,?,?)`);
  txnStmt.run('Stock In',  1, 200, 'INV-1001 | Birla Cement',       'PRJ-2024-01', '2025-10-28');
  txnStmt.run('Stock Out', 1,  50, 'Site A Block 1 | Jetharam Sir',  'PRJ-2024-01', '2025-10-30');
  txnStmt.run('Stock In',  4,  20, 'INV-1002 | Tata Steel',          '',            '2025-11-01');
  txnStmt.run('Stock Out', 3,  30, 'Foundation work | Ramesh',       'PRJ-2024-02', '2025-11-02');
  txnStmt.run('Stock Out', 2,  15, 'Plastering Site B | Mohan',      'PRJ-2024-02', '2025-11-05');
  txnStmt.run('Stock In',  6, 500, 'INV-1003 | Local Kiln',          '',            '2025-11-10');
  txnStmt.run('Stock Out', 5,   8, 'Roof slab | Jetharam Sir',       'PRJ-2024-01', '2025-11-15');
  txnStmt.run('Stock In',  7,  25, 'INV-1004 | Raj Aggregates',      '',            '2025-11-20');
  txnStmt.run('Stock Out', 1,  80, 'Site C Foundation | Ramesh',     'PRJ-2024-03', '2025-12-02');
  txnStmt.run('Stock In',  2,  40, 'INV-1005 | Rajasthan Agg.',      '',            '2025-12-05');
  txnStmt.run('Stock Out', 8,  20, 'Bathroom block | Mohan',         'PRJ-2024-03', '2025-12-08');
  txnStmt.run('Stock Out', 9, 200, 'Block D wiring | Electrician',   'PRJ-2024-03', '2025-12-12');

  console.log('[DB] Seeding complete.');
}

seedIfEmpty();

module.exports = db;
