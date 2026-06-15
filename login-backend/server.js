const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { connectDB } = require('./config/database');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5001', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all frontend files (HTML/CSS/JS/images) from the same folder
app.use(express.static(path.join(__dirname)));

// ── Root redirect → login page ────────────────────────────────────────────────
app.get('/', (_req, res) =>
  res.redirect('/login&signup.html')
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'Fair Ford Auth API is running' })
);

// ── Bootstrap — connect DB first, then start server ──────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`\n✅  Fair Ford Auth API  →  http://localhost:${PORT}\n`)
    );
  })
  .catch((err) => {
    console.error('\n❌  MongoDB connection failed:', err.message);
    console.error('    Check MONGO_URI in your .env file\n');
    process.exit(1);
  });

module.exports = app;
