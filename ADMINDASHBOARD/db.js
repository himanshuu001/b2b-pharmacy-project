"use strict";

const Database = require("better-sqlite3");
const path     = require("path");

const DB_PATH = path.join(__dirname, "fairford.db");
const db      = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

/* ── CREATE TABLES ─────────────────────────────────────────────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS retailers (
    id           TEXT PRIMARY KEY,
    store_name   TEXT NOT NULL,
    owner_name   TEXT,
    location     TEXT,
    kyc_status   TEXT DEFAULT 'Pending',
    kyc_verified INTEGER DEFAULT 0,
    credit_limit REAL DEFAULT 0,
    wallet_bal   REAL DEFAULT 0,
    avatar       TEXT
  );

  CREATE TABLE IF NOT EXISTS distributors (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id  TEXT NOT NULL,
    name         TEXT,
    location     TEXT,
    phone        TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS retailer_stats (
    retailer_id        TEXT PRIMARY KEY,
    orders_month       INTEGER DEFAULT 0,
    orders_change      TEXT,
    total_purchases    REAL DEFAULT 0,
    purchases_change   TEXT,
    outstanding_due    REAL DEFAULT 0,
    outstanding_change TEXT,
    outstanding_sub    TEXT,
    active_schemes     INTEGER DEFAULT 0,
    scheme_savings     TEXT,
    rx_filed           INTEGER DEFAULT 0,
    rx_change          TEXT,
    credit_available   REAL DEFAULT 0,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_trend (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    month       TEXT,
    purchases   REAL,
    payments    REAL,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          TEXT PRIMARY KEY,
    retailer_id TEXT NOT NULL,
    name        TEXT,
    qty         TEXT,
    amount      REAL,
    status      TEXT DEFAULT 'Pending',
    delivery    TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS payment_summary (
    retailer_id       TEXT PRIMARY KEY,
    total_outstanding REAL DEFAULT 0,
    overdue           REAL DEFAULT 0,
    paid_this_month   REAL DEFAULT 0,
    escrow_balance    REAL DEFAULT 0,
    credit_used       REAL DEFAULT 0,
    credit_limit      REAL DEFAULT 0,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS expiry_alerts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id  TEXT NOT NULL,
    product_name TEXT,
    batch        TEXT,
    expiry_date  TEXT,
    risk         TEXT DEFAULT 'normal',
    qty          TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS schemes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    icon        TEXT,
    name        TEXT,
    meta        TEXT,
    saving      TEXT,
    active      INTEGER DEFAULT 1,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS top_products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    rank        INTEGER,
    name        TEXT,
    category    TEXT,
    qty         TEXT,
    price       TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id          TEXT PRIMARY KEY,
    retailer_id TEXT NOT NULL,
    patient     TEXT,
    doctor      TEXT,
    status      TEXT DEFAULT 'Pending',
    date        TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS rx_stats (
    retailer_id TEXT PRIMARY KEY,
    uploaded    INTEGER DEFAULT 0,
    ai_verified INTEGER DEFAULT 0,
    pending     INTEGER DEFAULT 0,
    rejected    INTEGER DEFAULT 0,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS ai_insights (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    type        TEXT,
    icon        TEXT,
    color       TEXT,
    bg          TEXT,
    message     TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS category_spend (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    label       TEXT,
    value       REAL,
    color       TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id TEXT NOT NULL,
    message     TEXT,
    read_flag   INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    retailer_id  TEXT NOT NULL,
    product_name TEXT,
    price        REAL,
    qty          INTEGER DEFAULT 1,
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    price    REAL,
    unit     TEXT,
    category TEXT
  );
`);

/* ── SEED DATA (runs only once) ─────────────────────────────────── */
function seed() {
  const { c } = db.prepare("SELECT COUNT(*) AS c FROM retailers").get();
  if (c > 0) return;

  const RID = "RET-00421";

  db.prepare(`
    INSERT INTO retailers (id, store_name, owner_name, location, kyc_status, kyc_verified, credit_limit, wallet_bal, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(RID, "Apollo Pharmacy", "Apollo Pharmacy", "Mumbai", "KYC Verified", 1, 200000, 18450, "AP");

  db.prepare(`
    INSERT INTO distributors (retailer_id, name, location, phone)
    VALUES (?, ?, ?, ?)
  `).run(RID, "MedCore Distributors", "Andheri East, Mumbai", "+91 98200 44312");

  db.prepare(`
    INSERT INTO retailer_stats
      (retailer_id, orders_month, orders_change, total_purchases, purchases_change,
       outstanding_due, outstanding_change, outstanding_sub, active_schemes, scheme_savings,
       rx_filed, rx_change, credit_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(RID, 148, "↑ 23%", 482360, "↑ 18%", 48200, "↑ 5%", "Due in 7 days", 4, "₹6,240", 312, "↑ 9%", 151800);

  const insT = db.prepare("INSERT INTO purchase_trend (retailer_id, month, purchases, payments) VALUES (?, ?, ?, ?)");
  [
    ["Dec", 280000, 260000], ["Jan", 310000, 295000], ["Feb", 295000, 310000],
    ["Mar", 360000, 340000], ["Apr", 408000, 390000], ["May", 482360, 334160],
  ].forEach(([m, p, py]) => insT.run(RID, m, p, py));

  const insO = db.prepare("INSERT INTO orders (id, retailer_id, name, qty, amount, status, delivery) VALUES (?, ?, ?, ?, ?, ?, ?)");
  [
    ["ORD-7821", "Paracetamol 500mg × 200",  "4 products", 14200,  "Dispatched", "Today, 6 PM"],
    ["ORD-7818", "Antibiotic Bundle",          "7 products", 22800,  "Delivered",  "19 May"],
    ["ORD-7815", "Vitamins & Supplements",     "3 products", 8640,   "Pending",    "21 May"],
    ["ORD-7812", "Insulin & Diabetes Care",    "5 products", 38400,  "Delivered",  "18 May"],
    ["ORD-7809", "Cough & Cold Medicines",     "9 products", 6720,   "Dispatched", "20 May"],
    ["ORD-7806", "Cardiology Range",            "6 products", 51200,  "Pending",    "22 May"],
  ].forEach(([id, name, qty, amount, status, delivery]) => insO.run(id, RID, name, qty, amount, status, delivery));

  db.prepare(`
    INSERT INTO payment_summary (retailer_id, total_outstanding, overdue, paid_this_month, escrow_balance, credit_used, credit_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(RID, 48200, 12800, 334160, 18450, 48200, 200000);

  const insE = db.prepare("INSERT INTO expiry_alerts (retailer_id, product_name, batch, expiry_date, risk, qty) VALUES (?, ?, ?, ?, ?, ?)");
  [
    ["Paracetamol 500mg", "Batch #B2840", "Jun 2026", "critical", "280 strips"],
    ["Amoxicillin 250mg", "Batch #B2241", "Jul 2026", "warning",  "140 caps"  ],
    ["Cetirizine 10mg",   "Batch #B2109", "Aug 2026", "warning",  "90 tabs"   ],
    ["Omeprazole 20mg",   "Batch #B1984", "Oct 2026", "normal",   "200 caps"  ],
    ["Metformin 500mg",   "Batch #B2398", "Nov 2026", "normal",   "180 tabs"  ],
  ].forEach(([name, batch, date, risk, qty]) => insE.run(RID, name, batch, date, risk, qty));

  const insS = db.prepare("INSERT INTO schemes (retailer_id, icon, name, meta, saving) VALUES (?, ?, ?, ?, ?)");
  [
    ["🎁", "Buy 10 Get 1 — Paracetamol 500mg", "Expires Sep 15 · 47 retailers active",      "Save ₹480"  ],
    ["📈", "Extra 5% Margin — Vitamins Range",  "Expires Sep 30 · Applied automatically",    "Save ₹1,240"],
    ["🌧", "Seasonal Scheme — Monsoon Meds",    "Expires Sep 30 · New this month",           "Save ₹960"  ],
    ["💊", "Fast Moving — Antibiotics Bulk",    "Expires May 30 · Order before deadline",    "Save ₹3,560"],
  ].forEach(([icon, name, meta, saving]) => insS.run(RID, icon, name, meta, saving));

  const insTP = db.prepare("INSERT INTO top_products (retailer_id, rank, name, category, qty, price) VALUES (?, ?, ?, ?, ?, ?)");
  [
    [1, "Paracetamol 500mg",  "Analgesics",    "840 strips",   "₹42,000"],
    [2, "Amoxicillin 500mg",  "Antibiotics",   "420 capsules", "₹29,400"],
    [3, "Metformin 500mg",    "Antidiabetics", "360 tablets",  "₹21,600"],
    [4, "Atorvastatin 10mg",  "Cardiac",       "280 tablets",  "₹18,200"],
    [5, "Omeprazole 20mg",    "Gastro",        "240 capsules", "₹12,480"],
    [6, "Cetirizine 10mg",    "Antihistamine", "200 tablets",  "₹8,400" ],
  ].forEach(([rank, name, cat, qty, price]) => insTP.run(RID, rank, name, cat, qty, price));

  const insRx = db.prepare("INSERT INTO prescriptions (id, retailer_id, patient, doctor, status, date) VALUES (?, ?, ?, ?, ?, ?)");
  [
    ["RX-4821", "Rajesh Sharma", "Dr. A. Mehta", "Verified",  "20 May"],
    ["RX-4820", "Priya Iyer",    "Dr. S. Kumar", "Pending",   "20 May"],
    ["RX-4819", "Arun Nair",     "Dr. R. Joshi", "Verified",  "19 May"],
    ["RX-4818", "Sunita Patil",  "Dr. M. Rao",   "Rejected",  "19 May"],
  ].forEach(([id, patient, doctor, status, date]) => insRx.run(id, RID, patient, doctor, status, date));

  db.prepare("INSERT INTO rx_stats (retailer_id, uploaded, ai_verified, pending, rejected) VALUES (?, ?, ?, ?, ?)")
    .run(RID, 312, 282, 19, 14);

  const insAI = db.prepare("INSERT INTO ai_insights (retailer_id, type, icon, color, bg, message) VALUES (?, ?, ?, ?, ?, ?)");
  [
    ["Demand Spike",       "📊", "#6366f1", "#eef2ff", "Monsoon season ahead — stock up on ORS, anti-diarrheals and anti-malarials. Demand up 40%."],
    ["Reorder Alert",      "⚠️", "#f59e0b", "#fffbeb", "Paracetamol 500mg stock at 12-day cover. Recommended reorder: 500 strips today."],
    ["Scheme Opportunity", "💰", "#10b981", "#ecfdf5", "Vitamin C range qualifies for an extra 3% margin if ordered before May 25."],
    ["Payment Reminder",   "🔴", "#ef4444", "#fef2f2", "₹12,800 overdue balance. Pay before May 22 to avoid credit limit suspension."],
  ].forEach(([type, icon, color, bg, message]) => insAI.run(RID, type, icon, color, bg, message));

  const insC = db.prepare("INSERT INTO category_spend (retailer_id, label, value, color) VALUES (?, ?, ?, ?)");
  [
    ["Analgesics",    28, "#2563eb"],
    ["Antibiotics",   22, "#7c3aed"],
    ["Antidiabetics", 18, "#06b6d4"],
    ["Cardiac",       14, "#10b981"],
    ["Gastro",        10, "#f59e0b"],
    ["Others",         8, "#94a3b8"],
  ].forEach(([label, value, color]) => insC.run(RID, label, value, color));

  const insN = db.prepare("INSERT INTO notifications (retailer_id, message) VALUES (?, ?)");
  [
    "New order ORD-7821 has been dispatched — expected today 6 PM.",
    "Payment overdue: ₹12,800 outstanding for more than 15 days.",
    "New UPHAAR scheme available: Seasonal Monsoon Meds.",
    "Expiry alert: Paracetamol 500mg Batch #B2840 expires Jun 2026.",
    "AI Insight: Monsoon demand spike predicted — stock up now.",
  ].forEach(m => insN.run(RID, m));

  const insCart = db.prepare("INSERT INTO cart_items (retailer_id, product_name, price, qty) VALUES (?, ?, ?, ?)");
  [
    ["Paracetamol 500mg", 420, 1],
    ["Vitamin C 500mg",   380, 1],
    ["Amoxicillin 500mg", 700, 1],
  ].forEach(([name, price, qty]) => insCart.run(RID, name, price, qty));

  const insP = db.prepare("INSERT INTO products (name, price, unit, category) VALUES (?, ?, ?, ?)");
  [
    ["Paracetamol 500mg",   420,  "per 100 strips",  "Analgesics"   ],
    ["Amoxicillin 500mg",   700,  "per 100 caps",    "Antibiotics"  ],
    ["Metformin 500mg",     600,  "per 100 tabs",    "Antidiabetics"],
    ["Atorvastatin 10mg",   650,  "per 100 tabs",    "Cardiac"      ],
    ["Omeprazole 20mg",     520,  "per 100 caps",    "Gastro"       ],
    ["Cetirizine 10mg",     420,  "per 100 tabs",    "Antihistamine"],
    ["Azithromycin 500mg",  980,  "per 100 tabs",    "Antibiotics"  ],
    ["Pantoprazole 40mg",   560,  "per 100 tabs",    "Gastro"       ],
    ["Cough Syrup 100ml",   120,  "per bottle",      "Others"       ],
    ["Vitamin C 500mg",     380,  "per 100 tabs",    "Others"       ],
    ["ORS Sachets",          80,  "per 10 sachets",  "Others"       ],
    ["Anti-malarial Combo", 1240, "per 10 strips",   "Others"       ],
  ].forEach(([name, price, unit, cat]) => insP.run(name, price, unit, cat));

  console.log("[DB] Seeded fresh database with sample data.");
}

seed();

module.exports = db;
