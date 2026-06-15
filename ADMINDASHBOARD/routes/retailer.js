"use strict";

const express = require("express");
const router  = express.Router();
const db      = require("../db");

/* ── GET /:id — retailer profile + distributor ─────────────────── */
router.get("/:id", (req, res) => {
  const retailer = db.prepare("SELECT * FROM retailers WHERE id = ?").get(req.params.id);
  if (!retailer) return res.status(404).json({ error: "Retailer not found" });

  const distributor = db.prepare("SELECT * FROM distributors WHERE retailer_id = ?").get(req.params.id);
  res.json({ ...retailer, distributor: distributor || null });
});

/* ── GET /:id/stats — dashboard stat cards ─────────────────────── */
router.get("/:id/stats", (req, res) => {
  const stats = db.prepare("SELECT * FROM retailer_stats WHERE retailer_id = ?").get(req.params.id);
  if (!stats) return res.status(404).json({ error: "Stats not found" });
  res.json(stats);
});

/* ── GET /:id/purchase-trend — 6-month purchase/payment chart ──── */
router.get("/:id/purchase-trend", (req, res) => {
  const trend = db
    .prepare("SELECT month, purchases, payments FROM purchase_trend WHERE retailer_id = ? ORDER BY id ASC")
    .all(req.params.id);
  res.json(trend);
});

/* ── GET /:id/orders — recent orders (optional ?status= filter) ── */
router.get("/:id/orders", (req, res) => {
  const { status } = req.query;
  let sql    = "SELECT * FROM orders WHERE retailer_id = ?";
  const args = [req.params.id];

  if (status && status !== "all") {
    sql += " AND status = ?";
    args.push(status);
  }
  sql += " ORDER BY created_at DESC LIMIT 20";

  const orders = db.prepare(sql).all(...args);
  res.json(orders);
});

/* ── GET /:id/orders/:orderId — single order detail ───────────── */
router.get("/:id/orders/:orderId", (req, res) => {
  const order = db.prepare(
    "SELECT * FROM orders WHERE id = ? AND retailer_id = ?"
  ).get(req.params.orderId, req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

/* ── POST /:id/orders — place new order ────────────────────────── */
router.post("/:id/orders", (req, res) => {
  const { items, priority, total } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "No items in order" });

  const seq      = db.prepare("SELECT COUNT(*) AS c FROM orders").get().c;
  const orderId  = `ORD-${7900 + seq}`;
  const name     = items.map(i => i.name).join(", ").substring(0, 60);
  const qty      = `${items.length} product${items.length > 1 ? "s" : ""}`;
  const delivery = { standard: "2-3 days", express: "Same day", urgent: "4 hrs" }[priority] || "2-3 days";

  db.prepare(
    "INSERT INTO orders (id, retailer_id, name, qty, amount, status, delivery) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(orderId, req.params.id, name, qty, total || 0, "Pending", delivery);

  /* Update stats: increment orders_month */
  db.prepare("UPDATE retailer_stats SET orders_month = orders_month + 1 WHERE retailer_id = ?")
    .run(req.params.id);

  res.json({ success: true, order_id: orderId });
});

/* ── PATCH /:id/orders/:orderId — update order status ──────────── */
router.patch("/:id/orders/:orderId", (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Dispatched", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

  db.prepare("UPDATE orders SET status = ? WHERE id = ? AND retailer_id = ?")
    .run(status, req.params.orderId, req.params.id);
  res.json({ success: true });
});

/* ── GET /:id/payment-summary — ledger snapshot ─────────────────── */
router.get("/:id/payment-summary", (req, res) => {
  const ps = db.prepare("SELECT * FROM payment_summary WHERE retailer_id = ?").get(req.params.id);
  if (!ps) return res.status(404).json({ error: "Payment summary not found" });
  res.json(ps);
});

/* ── POST /:id/payment — make a payment ────────────────────────── */
router.post("/:id/payment", (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const ps = db.prepare("SELECT * FROM payment_summary WHERE retailer_id = ?").get(req.params.id);
  if (!ps) return res.status(404).json({ error: "Payment summary not found" });

  const newOutstanding = Math.max(0, ps.total_outstanding - amount);
  const newCreditUsed  = Math.max(0, ps.credit_used - amount);
  const newEscrow      = Math.max(0, ps.escrow_balance - amount);

  db.prepare(`
    UPDATE payment_summary
    SET total_outstanding = ?, credit_used = ?, escrow_balance = ?, paid_this_month = paid_this_month + ?
    WHERE retailer_id = ?
  `).run(newOutstanding, newCreditUsed, newEscrow, amount, req.params.id);

  /* Sync wallet balance */
  db.prepare("UPDATE retailers SET wallet_bal = ? WHERE id = ?").run(newEscrow, req.params.id);

  res.json({ success: true, new_outstanding: newOutstanding });
});

/* ── GET /:id/expiry-alerts ─────────────────────────────────────── */
router.get("/:id/expiry-alerts", (req, res) => {
  const alerts = db.prepare(
    "SELECT * FROM expiry_alerts WHERE retailer_id = ? ORDER BY id ASC"
  ).all(req.params.id);
  res.json(alerts);
});

/* ── GET /:id/schemes — active UPHAAR schemes ───────────────────── */
router.get("/:id/schemes", (req, res) => {
  const schemes = db.prepare(
    "SELECT * FROM schemes WHERE retailer_id = ? AND active = 1 ORDER BY id ASC"
  ).all(req.params.id);
  res.json(schemes);
});

/* ── GET /:id/top-products ──────────────────────────────────────── */
router.get("/:id/top-products", (req, res) => {
  const products = db.prepare(
    "SELECT * FROM top_products WHERE retailer_id = ? ORDER BY rank ASC"
  ).all(req.params.id);
  res.json(products);
});

/* ── GET /:id/prescriptions — stats + recent list ───────────────── */
router.get("/:id/prescriptions", (req, res) => {
  const list  = db.prepare(
    "SELECT * FROM prescriptions WHERE retailer_id = ? ORDER BY date DESC"
  ).all(req.params.id);
  const stats = db.prepare("SELECT * FROM rx_stats WHERE retailer_id = ?").get(req.params.id);
  res.json({ stats: stats || {}, list });
});

/* ── POST /:id/prescriptions — upload new Rx ────────────────────── */
router.post("/:id/prescriptions", (req, res) => {
  const { patient, doctor, date } = req.body;
  if (!patient || !doctor) return res.status(400).json({ error: "Missing patient or doctor" });

  const count = db.prepare("SELECT COUNT(*) AS c FROM prescriptions WHERE retailer_id = ?").get(req.params.id).c;
  const id    = `RX-${4900 + count}`;

  db.prepare("INSERT INTO prescriptions (id, retailer_id, patient, doctor, status, date) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, req.params.id, patient, doctor, "Pending", date || new Date().toLocaleDateString("en-IN"));

  db.prepare("UPDATE rx_stats SET uploaded = uploaded + 1, pending = pending + 1 WHERE retailer_id = ?")
    .run(req.params.id);

  res.json({ success: true, id });
});

/* ── GET /:id/ai-insights ───────────────────────────────────────── */
router.get("/:id/ai-insights", (req, res) => {
  const insights = db.prepare(
    "SELECT * FROM ai_insights WHERE retailer_id = ? ORDER BY id ASC"
  ).all(req.params.id);
  res.json(insights);
});

/* ── GET /:id/category-spend — donut chart data ─────────────────── */
router.get("/:id/category-spend", (req, res) => {
  const cats = db.prepare(
    "SELECT * FROM category_spend WHERE retailer_id = ? ORDER BY id ASC"
  ).all(req.params.id);
  res.json(cats);
});

/* ── GET /:id/notifications ─────────────────────────────────────── */
router.get("/:id/notifications", (req, res) => {
  const items = db.prepare(
    "SELECT * FROM notifications WHERE retailer_id = ? ORDER BY created_at DESC"
  ).all(req.params.id);
  const count = items.filter(n => !n.read_flag).length;
  res.json({ count, items });
});

/* ── PUT /:id/notifications/mark-read ──────────────────────────── */
router.put("/:id/notifications/mark-read", (req, res) => {
  db.prepare("UPDATE notifications SET read_flag = 1 WHERE retailer_id = ?").run(req.params.id);
  res.json({ success: true });
});

/* ── GET /:id/cart ──────────────────────────────────────────────── */
router.get("/:id/cart", (req, res) => {
  const items = db.prepare("SELECT * FROM cart_items WHERE retailer_id = ?").all(req.params.id);
  const count = items.reduce((s, i) => s + i.qty, 0);
  res.json({ count, items });
});

/* ── POST /:id/cart — add / increment item ──────────────────────── */
router.post("/:id/cart", (req, res) => {
  const { product_name, price, qty = 1 } = req.body;
  if (!product_name || !price) return res.status(400).json({ error: "Missing product_name or price" });

  const existing = db.prepare(
    "SELECT * FROM cart_items WHERE retailer_id = ? AND product_name = ?"
  ).get(req.params.id, product_name);

  if (existing) {
    db.prepare("UPDATE cart_items SET qty = qty + ? WHERE id = ?").run(qty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (retailer_id, product_name, price, qty) VALUES (?, ?, ?, ?)")
      .run(req.params.id, product_name, price, qty);
  }

  const items = db.prepare("SELECT * FROM cart_items WHERE retailer_id = ?").all(req.params.id);
  res.json({ success: true, count: items.reduce((s, i) => s + i.qty, 0), items });
});

/* ── DELETE /:id/cart/:itemId — remove one item ─────────────────── */
router.delete("/:id/cart/:itemId", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND retailer_id = ?")
    .run(req.params.itemId, req.params.id);
  const items = db.prepare("SELECT * FROM cart_items WHERE retailer_id = ?").all(req.params.id);
  res.json({ success: true, count: items.reduce((s, i) => s + i.qty, 0), items });
});

/* ── DELETE /:id/cart — clear entire cart ───────────────────────── */
router.delete("/:id/cart", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE retailer_id = ?").run(req.params.id);
  res.json({ success: true, count: 0, items: [] });
});

module.exports = router;
