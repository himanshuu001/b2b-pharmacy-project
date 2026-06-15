require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Retailer = require('../models/Retailer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const Scheme = require('../models/Scheme');
const ExpiryAlert = require('../models/ExpiryAlert');
const AIAlert = require('../models/AIAlert');
const PurchaseSpend = require('../models/PurchaseSpend');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Retailer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Prescription.deleteMany({});
    await Scheme.deleteMany({});
    await ExpiryAlert.deleteMany({});
    await AIAlert.deleteMany({});
    await PurchaseSpend.deleteMany({});

    // 1. Seed Retailer
    console.log('Seeding Retailer Profile...');
    const retailer = await Retailer.create({
      name: 'Apollo Pharmacy',
      role: 'Retailer',
      location: 'Mumbai',
      kycStatus: 'Verified',
      kycId: 'RET-00421',
      creditLimit: 200000,
      creditUsed: 48200,
      walletBalance: 18450,
      outstandingDue: 48200,
      overdueAmount: 12800,
      paidThisMonth: 334160,
      escrowBalance: 18450,
      distributor: {
        name: 'MedCore Distributors',
        location: 'Andheri East, Mumbai',
        phone: '+91 98200 44312'
      }
    });

    // 2. Seed Products (Catalogue + Rank information for top products)
    console.log('Seeding Product Catalogue...');
    await Product.create([
      { name: "Paracetamol 500mg", price: 420, unit: "per 100 strips", category: "Analgesics", rank: 1, qty: "840 strips" },
      { name: "Amoxicillin 500mg", price: 700, unit: "per 100 caps", category: "Antibiotics", rank: 2, qty: "420 capsules" },
      { name: "Metformin 500mg", price: 600, unit: "per 100 tabs", category: "Antidiabetics", rank: 3, qty: "360 tablets" },
      { name: "Atorvastatin 10mg", price: 650, unit: "per 100 tabs", category: "Cardiac", rank: 4, qty: "280 tablets" },
      { name: "Omeprazole 20mg", price: 520, unit: "per 100 caps", category: "Gastro", rank: 5, qty: "240 capsules" },
      { name: "Cetirizine 10mg", price: 420, unit: "per 100 tabs", category: "Antihistamine", rank: 6, qty: "200 tablets" },
      { name: "Azithromycin 500mg", price: 980, unit: "per 100 tabs", category: "Antibiotics" },
      { name: "Pantoprazole 40mg", price: 560, unit: "per 100 tabs", category: "Gastro" },
      { name: "Cough Syrup 100ml", price: 120, unit: "per bottle", category: "Others" },
      { name: "Vitamin C 500mg", price: 380, unit: "per 100 tabs", category: "Others" },
      { name: "ORS Sachets", price: 80, unit: "per 10 sachets", category: "Others" },
      { name: "Anti-malarial Combo", price: 1240, unit: "per 10 strips", category: "Antibiotics" }
    ]);

    // 3. Seed Purchase Trend / Spending Data
    console.log('Seeding Spend trends...');
    await PurchaseSpend.create([
      { month: "Dec", purchases: 280000, payments: 260000 },
      { month: "Jan", purchases: 310000, payments: 295000 },
      { month: "Feb", purchases: 295000, payments: 310000 },
      { month: "Mar", purchases: 360000, payments: 340000 },
      { month: "Apr", purchases: 408000, payments: 390000 },
      { month: "May", purchases: 482360, payments: 334160 }
    ]);

    // 4. Seed Recent Orders
    console.log('Seeding Orders history...');
    await Order.create([
      {
        id: "ORD-7821",
        name: "Paracetamol 500mg × 200",
        qty: "4 products",
        amount: 14200,
        status: "Dispatched",
        delivery: "Today, 6 PM",
        priority: "standard",
        retailer: retailer._id,
        items: [
          { name: "Paracetamol 500mg", price: 4.2, qty: 200 }
        ]
      },
      {
        id: "ORD-7818",
        name: "Antibiotic Bundle",
        qty: "7 products",
        amount: 22800,
        status: "Delivered",
        delivery: "19 May",
        priority: "standard",
        retailer: retailer._id,
        items: []
      },
      {
        id: "ORD-7815",
        name: "Vitamins & Supplements",
        qty: "3 products",
        amount: 8640,
        status: "Pending",
        delivery: "21 May",
        priority: "standard",
        retailer: retailer._id,
        items: []
      },
      {
        id: "ORD-7812",
        name: "Insulin & Diabetes Care",
        qty: "5 products",
        amount: 38400,
        status: "Delivered",
        delivery: "18 May",
        priority: "standard",
        retailer: retailer._id,
        items: []
      },
      {
        id: "ORD-7809",
        name: "Cough & Cold Medicines",
        qty: "9 products",
        amount: 6720,
        status: "Dispatched",
        delivery: "20 May",
        priority: "standard",
        retailer: retailer._id,
        items: []
      },
      {
        id: "ORD-7806",
        name: "Cardiology Range",
        qty: "6 products",
        amount: 51200,
        status: "Pending",
        delivery: "22 May",
        priority: "standard",
        retailer: retailer._id,
        items: []
      }
    ]);

    // 5. Seed Expiry Alerts
    console.log('Seeding Expiry alerts...');
    await ExpiryAlert.create([
      { name: "Paracetamol 500mg", batch: "Batch #B2840", date: "Jun 2026", risk: "critical", qty: "280 strips" },
      { name: "Amoxicillin 250mg", batch: "Batch #B2241", date: "Jul 2026", risk: "warning", qty: "140 caps" },
      { name: "Cetirizine 10mg", batch: "Batch #B2109", date: "Aug 2026", risk: "warning", qty: "90 tabs" },
      { name: "Omeprazole 20mg", batch: "Batch #B1984", date: "Oct 2026", risk: "normal", qty: "200 caps" },
      { name: "Metformin 500mg", batch: "Batch #B2398", date: "Nov 2026", risk: "normal", qty: "180 tabs" }
    ]);

    // 6. Seed Schemes
    console.log('Seeding Schemes...');
    await Scheme.create([
      { icon: "🎁", name: "Buy 10 Get 1 — Paracetamol 500mg", meta: "Expires Sep 15 · 47 retailers active", saving: "Save ₹480" },
      { icon: "⚡", name: "Extra 5% Margin — Vitamins Range", meta: "Expires Sep 30 · Applied automatically", saving: "Save ₹1,240" },
      { icon: "🌧️", name: "Seasonal Scheme — Monsoon Meds", meta: "Expires Sep 30 · New this month", saving: "Save ₹960" },
      { icon: "📦", name: "Fast Moving — Antibiotics Bulk", meta: "Expires May 30 · Order before deadline", saving: "Save ₹3,560" }
    ]);

    // 7. Seed Prescriptions
    console.log('Seeding Prescriptions...');
    await Prescription.create([
      { id: "RX-4821", patient: "Rajesh Sharma", doc: "Dr. A. Mehta", status: "Verified", date: "20 May" },
      { id: "RX-4820", patient: "Priya Iyer", doc: "Dr. S. Kumar", status: "Pending", date: "20 May" },
      { id: "RX-4819", patient: "Arun Nair", doc: "Dr. R. Joshi", status: "Verified", date: "19 May" },
      { id: "RX-4818", patient: "Sunita Patil", doc: "Dr. M. Rao", status: "Rejected", date: "19 May" }
    ]);

    // 8. Seed AI Alerts
    console.log('Seeding AI Alerts...');
    await AIAlert.create([
      { type: "Demand Spike", icon: "📈", color: "#6366f1", bg: "#eef2ff", msg: "Monsoon season ahead — stock up on ORS, anti-diarrheals and anti-malarials. Demand up 40%." },
      { type: "Reorder Alert", icon: "⚠️", color: "#f59e0b", bg: "#fffbeb", msg: "Paracetamol 500mg stock at 12-day cover. Recommended reorder: 500 strips today." },
      { type: "Scheme Opportunity", icon: "💡", color: "#10b981", bg: "#ecfdf5", msg: "Vitamin C range qualifies for an extra 3% margin if ordered before May 25." },
      { type: "Payment Reminder", icon: "⏰", color: "#ef4444", bg: "#fef2f2", msg: "₹12,800 overdue balance. Pay before May 22 to avoid credit limit suspension." }
    ]);

    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
