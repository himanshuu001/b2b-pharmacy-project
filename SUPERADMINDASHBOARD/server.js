require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'fairford-products', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'superadmin.html'));
});

/* ── DASHBOARD ── */
app.get('/api/dashboard', async (req, res) => {
  try {
    const [pending, distributors, retailers] = await Promise.all([
      db.findAll('approvals', { status: 'pending' }),
      db.findAll('distributors', { status: 'active' }),
      db.findAll('retailers', { status: 'active' }),
    ]);
    res.json({ pending_approvals: pending.length, active_distributors: distributors.length, active_retailers: retailers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── APPROVALS ── */
app.get('/api/approvals', async (req, res) => {
  try {
    const { status } = req.query;
    res.json(await db.findAll('approvals', status ? { status } : {}));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/approvals/bulk-approve', async (req, res) => {
  try {
    const count = await db.updateWhere('approvals', { status: 'pending' }, { status: 'approved' });
    res.json({ success: true, updated: count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/approvals/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const row = await db.update('approvals', req.params.id, { status });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DISTRIBUTORS ── */
app.get('/api/distributors', async (req, res) => {
  try {
    res.json(await db.findAll('distributors'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/distributors', async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name || !state) return res.status(400).json({ error: 'name and state are required' });
    const row = await db.insert('distributors', {
      initials: req.body.initials || name.slice(0, 2).toUpperCase(),
      color_class: req.body.color_class || 'av-pur',
      name, state,
      retailers_count: req.body.retailers_count || 0,
      may_gmv: req.body.may_gmv || '₹0',
      outstanding: req.body.outstanding || '₹0',
      status: req.body.status || 'active',
    });
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/distributors/:id', async (req, res) => {
  try {
    const row = await db.update('distributors', req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/distributors/:id', async (req, res) => {
  try {
    const row = await db.findById('distributors', req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/distributors/:id', async (req, res) => {
  try {
    const removed = await db.remove('distributors', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── RETAILERS ── */
app.get('/api/retailers', async (req, res) => {
  try {
    res.json(await db.findAll('retailers'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/retailers', async (req, res) => {
  try {
    const { name, city } = req.body;
    if (!name || !city) return res.status(400).json({ error: 'name and city are required' });
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const row = await db.insert('retailers', {
      name, city,
      type: req.body.type || 'Medical Store',
      distributor: req.body.distributor || '',
      monthly_orders: req.body.monthly_orders || 0,
      last_order: req.body.last_order || today,
      status: req.body.status || 'active',
    });
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/retailers/:id', async (req, res) => {
  try {
    const row = await db.update('retailers', req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/retailers/:id', async (req, res) => {
  try {
    const row = await db.findById('retailers', req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/retailers/:id', async (req, res) => {
  try {
    const removed = await db.remove('retailers', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PRICING ── */
app.get('/api/pricing', async (req, res) => {
  try {
    res.json(await db.findAll('price_rules'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pricing', async (req, res) => {
  try {
    const { category, channel = 'Distributor → Retailer', mrp, dist_margin, retail_margin, gst_rate, status } = req.body;
    if (!category) return res.status(400).json({ error: 'category is required' });
    const rules = await db.findAll('price_rules');
    const existing = rules.find(r => r.category === category && r.channel === channel);
    if (existing) {
      await db.update('price_rules', existing.id, { mrp, dist_margin, retail_margin, gst_rate, status: status || 'active' });
      return res.json({ id: existing.id, success: true, updated: true });
    }
    const row = await db.insert('price_rules', { category, channel, mrp, dist_margin, retail_margin, gst_rate: gst_rate || '12%', status: status || 'active' });
    res.status(201).json({ id: row.id, success: true, updated: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── WALLET SETTLEMENTS ── */
app.get('/api/wallet', async (req, res) => {
  try {
    res.json(await db.findAll('settlements'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/wallet/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['settled', 'escrow', 'overdue', 'due_today', 'pending'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const row = await db.update('settlements', req.params.id, { status });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── SCHEMES ── */
function computeSchemeStatus(start_date, end_date) {
  const today = new Date().toISOString().slice(0, 10);
  if (today < start_date) return 'upcoming';
  if (today > end_date) return 'ended';
  return 'active';
}

app.get('/api/schemes', async (req, res) => {
  try {
    const rows = await db.findAll('schemes');
    const result = rows
      .map(s => ({ ...s, status: computeSchemeStatus(s.start_date, s.end_date) }))
      .filter(s => s.status !== 'ended');
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/schemes', async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'name, start_date, end_date are required' });
    }
    const row = await db.insert('schemes', {
      name,
      type: req.body.type || 'Flat Discount %',
      category: req.body.category || 'All Products',
      channel: req.body.channel || 'Both',
      description: req.body.description || '',
      start_date, end_date,
      target: req.body.target || 0,
      redemptions: 0,
      status: computeSchemeStatus(start_date, end_date),
    });
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/schemes/:id', async (req, res) => {
  try {
    const patch = { ...req.body };
    if (patch.start_date || patch.end_date) {
      const current = await db.findById('schemes', req.params.id);
      if (current) {
        patch.status = computeSchemeStatus(
          patch.start_date || current.start_date,
          patch.end_date || current.end_date
        );
      }
    }
    const row = await db.update('schemes', req.params.id, patch);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/schemes/:id', async (req, res) => {
  try {
    const removed = await db.remove('schemes', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── INVENTORY ── */
app.get('/api/inventory', async (req, res) => {
  try {
    const filter = req.query.distributor ? { distributor: req.query.distributor } : {};
    const rows = (await db.findAll('inventory', filter)).map(r => ({ ...r, available: r.total_stock - r.reserved }));
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const allowed = ['total_stock', 'reserved', 'reorder_level', 'status'];
    const patch = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'No valid fields to update' });
    const row = await db.update('inventory', req.params.id, patch);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DISTRIBUTOR-RETAILER MAPPING ── */
app.get('/api/dist-mapping', async (req, res) => {
  try {
    res.json(await db.findAll('dist_mapping'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/dist-mapping', async (req, res) => {
  try {
    const { distributor, state } = req.body;
    if (!distributor || !state) return res.status(400).json({ error: 'distributor and state are required' });
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const row = await db.insert('dist_mapping', {
      initials: req.body.initials || distributor.slice(0, 2).toUpperCase(),
      color_class: req.body.color_class || 'av-pur',
      distributor, state,
      district: req.body.district || '',
      retailers_mapped: req.body.retailers_mapped || 0,
      coverage_pct: req.body.coverage_pct || 0,
      last_updated: today,
    });
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/dist-mapping/:id', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const row = await db.update('dist_mapping', req.params.id, { ...req.body, last_updated: today });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/dist-mapping/:id', async (req, res) => {
  try {
    const removed = await db.remove('dist_mapping', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/pricing/:id', async (req, res) => {
  try {
    const removed = await db.remove('price_rules', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PRODUCTS ── */
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.findAll('products');
    const { role } = req.query;
    if (role === 'retailer') {
      return res.json(products.map(({ price_to_distributor, ...p }) => p));
    }
    if (role === 'distributor') {
      return res.json(products.map(({ price_to_retailer, ...p }) => p));
    }
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.findById('products', req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, sku, category, mrp, manufacturer } = req.body;
    if (!name || !sku || !category || !mrp) {
      return res.status(400).json({ error: 'name, sku, category, mrp are required' });
    }
    let image_url = '';
    if (req.file) image_url = await uploadToCloudinary(req.file.buffer);
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const row = await db.insert('products', {
      name,
      sku,
      category,
      mrp: parseInt(mrp),
      price_to_distributor: req.body.price_to_distributor ? parseInt(req.body.price_to_distributor) : null,
      price_to_retailer: req.body.price_to_retailer ? parseInt(req.body.price_to_retailer) : null,
      manufacturer: manufacturer || 'Fair Ford Pharma',
      stock: parseInt(req.body.stock) || 0,
      description: req.body.description || '',
      status: req.body.status || 'active',
      image_url,
      created_date: today,
    });
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const patch = { ...req.body };
    if (req.file) patch.image_url = await uploadToCloudinary(req.file.buffer);
    if (patch.mrp) patch.mrp = parseInt(patch.mrp);
    if (patch.stock) patch.stock = parseInt(patch.stock);
    patch.price_to_distributor = patch.price_to_distributor ? parseInt(patch.price_to_distributor) : null;
    patch.price_to_retailer = patch.price_to_retailer ? parseInt(patch.price_to_retailer) : null;
    const row = await db.update('products', req.params.id, patch);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); } 
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const removed = await db.remove('products', req.params.id);
    if (!removed) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── NOTIFICATIONS ── */
app.post('/api/notify/low-stock', async (req, res) => {
  try {
    const { distributor_name, email, items = [] } = req.body;
    if (!distributor_name) return res.status(400).json({ error: 'distributor_name required' });
    // Production: replace with nodemailer / SendGrid call
    console.log(`[EMAIL] Low-stock alert → ${distributor_name} <${email}> — ${items.length} item(s): ${items.map(i => i.sku).join(', ')}`);
    res.json({ success: true, message: `Email reminder sent to ${distributor_name}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── START ── */
db.connect()
  .then(() => {
    app.listen(PORT, () => {
      // console.log("server started on port 3000");
      console.log(`Fair Ford Super Admin API  →  http://localhost:${PORT}/api`);
      console.log(`Dashboard                  →  http://localhost:${PORT}/`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
