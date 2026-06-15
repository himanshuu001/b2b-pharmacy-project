

"use strict";

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const retailerRoutes = require("./routes/retailer");
const productRoutes  = require("./routes/products");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* Serve static frontend files from this same directory */
app.use(express.static(path.join(__dirname)));

app.use("/api/retailer", retailerRoutes);
app.use("/api/products",  productRoutes);

/* 404 for unknown API routes */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.listen(PORT, () => {
  console.log(`\n  Fair Ford API running at http://localhost:${PORT}`);
  console.log(`  Open in browser: http://localhost:${PORT}/retailer.html\n`);
});
