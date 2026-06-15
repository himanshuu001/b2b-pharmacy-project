require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend'), { dotfiles: 'ignore' }));

const registerRoutes = () => {
  const orderRoutes = require('./routes/orderRoutes');
  const productRoutes = require('./routes/productRoutes');
  const retailerRoutes = require('./routes/retailerRoutes');

  app.use('/api/orders', orderRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/retailer', retailerRoutes);

  app.get('/api/dashboard/trends', async (req, res) => {
    try {
      const PurchaseSpend = require('./models/PurchaseSpend');
      const trends = await PurchaseSpend.find().sort({ createdAt: 1 });
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/dashboard/categories', (req, res) => {
    const categoryData = [
      { label: 'Analgesics', value: 28, color: '#2563eb' },
      { label: 'Antibiotics', value: 22, color: '#7c3aed' },
      { label: 'Antidiabetics', value: 18, color: '#06b6d4' },
      { label: 'Cardiac', value: 14, color: '#10b981' },
      { label: 'Gastro', value: 10, color: '#f59e0b' },
      { label: 'Others', value: 8, color: '#94a3b8' }
    ];
    res.json(categoryData);
  });

  app.get('/api/expiry-alerts', async (req, res) => {
    try {
      const ExpiryAlert = require('./models/ExpiryAlert');
      const alerts = await ExpiryAlert.find().sort({ date: 1 });
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/schemes', async (req, res) => {
    try {
      const Scheme = require('./models/Scheme');
      const schemesList = await Scheme.find();
      res.json(schemesList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/prescriptions', async (req, res) => {
    try {
      const Prescription = require('./models/Prescription');
      const rxList = await Prescription.find().sort({ createdAt: -1 });
      res.json(rxList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/prescriptions', async (req, res) => {
    try {
      const Prescription = require('./models/Prescription');
      const { patient, doc } = req.body;
      if (!patient || !doc) {
        return res.status(400).json({ message: 'Patient and Doctor names are required' });
      }

      const randomNum = Math.floor(4000 + Math.random() * 1000);
      const rxId = `RX-${randomNum}`;
      const now = new Date();
      const dateText = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}`;

      const newRx = await Prescription.create({
        id: rxId,
        patient,
        doc,
        status: 'Pending',
        date: dateText
      });

      res.status(201).json(newRx);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/ai-alerts', async (req, res) => {
    try {
      const AIAlert = require('./models/AIAlert');
      const alerts = await AIAlert.find();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'retailer.html'));
  });

  app.use(notFound);
  app.use(errorHandler);
};

const startServer = async () => {
  await connectDB();
  registerRoutes();
  const PORT = process.env.PORT || 1234;
  const server = app.listen(PORT, () => {
    console.log(`Fair Ford Retailer Panel server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please stop the existing process or set a different PORT.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

startServer();
