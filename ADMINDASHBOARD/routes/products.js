"use strict";

const express = require("express");
const router  = express.Router();
const db      = require("../db");

/* ── GET /search?q= — fuzzy product search for order modal ─────── */
router.get("/search", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const results = db.prepare(
    "SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC LIMIT 10"
  ).all(`%${q}%`);
  res.json(results);
});

/* ── GET / — full product catalogue ────────────────────────────── */
router.get("/", (req, res) => {
  const products = db.prepare("SELECT * FROM products ORDER BY name ASC").all();
  res.json(products);
});

module.exports = router;
