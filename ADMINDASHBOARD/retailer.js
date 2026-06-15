/**
 * Fair Ford · Retailer Panel · retailer.js
 * Vanilla JS — no framework. Depends on Chart.js (CDN).
 */

"use strict";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

const purchaseData = [
  { month: "Dec", purchases: 280000, payments: 260000 },
  { month: "Jan", purchases: 310000, payments: 295000 },
  { month: "Feb", purchases: 295000, payments: 310000 },
  { month: "Mar", purchases: 360000, payments: 340000 },
  { month: "Apr", purchases: 408000, payments: 390000 },
  { month: "May", purchases: 482360, payments: 334160 },
];

const recentOrders = [
  { id: "ORD-7821", name: "Paracetamol 500mg × 200", qty: "4 products", amount: 14200, status: "Dispatched", delivery: "Today, 6 PM" },
  { id: "ORD-7818", name: "Antibiotic Bundle",        qty: "7 products", amount: 22800, status: "Delivered",  delivery: "19 May" },
  { id: "ORD-7815", name: "Vitamins & Supplements",   qty: "3 products", amount: 8640,  status: "Pending",    delivery: "21 May" },
  { id: "ORD-7812", name: "Insulin & Diabetes Care",  qty: "5 products", amount: 38400, status: "Delivered",  delivery: "18 May" },
  { id: "ORD-7809", name: "Cough & Cold Medicines",   qty: "9 products", amount: 6720,  status: "Dispatched", delivery: "20 May" },
  { id: "ORD-7806", name: "Cardiology Range",          qty: "6 products", amount: 51200, status: "Pending",    delivery: "22 May" },
];

const expiryAlerts = [
  { name: "Paracetamol 500mg", batch: "Batch #B2840", date: "Jun 2026", risk: "critical", qty: "280 strips" },
  { name: "Amoxicillin 250mg", batch: "Batch #B2241", date: "Jul 2026", risk: "warning",  qty: "140 caps"   },
  { name: "Cetirizine 10mg",   batch: "Batch #B2109", date: "Aug 2026", risk: "warning",  qty: "90 tabs"    },
  { name: "Omeprazole 20mg",   batch: "Batch #B1984", date: "Oct 2026", risk: "normal",   qty: "200 caps"   },
  { name: "Metformin 500mg",   batch: "Batch #B2398", date: "Nov 2026", risk: "normal",   qty: "180 tabs"   },
];

const schemes = [
  { icon: "", name: "Buy 10 Get 1 — Paracetamol 500mg", meta: "Expires Sep 15 · 47 retailers active", saving: "Save ₹480" },
  { icon: "", name: "Extra 5% Margin — Vitamins Range",  meta: "Expires Sep 30 · Applied automatically", saving: "Save ₹1,240" },
  { icon: "", name: "Seasonal Scheme — Monsoon Meds",    meta: "Expires Sep 30 · New this month",       saving: "Save ₹960" },
  { icon: "", name: "Fast Moving — Antibiotics Bulk",    meta: "Expires May 30 · Order before deadline", saving: "Save ₹3,560" },
];

const topProducts = [
  { rank: 1, name: "Paracetamol 500mg",   cat: "Analgesics",    qty: "840 strips",  price: "₹42,000" },
  { rank: 2, name: "Amoxicillin 500mg",   cat: "Antibiotics",   qty: "420 capsules",price: "₹29,400" },
  { rank: 3, name: "Metformin 500mg",     cat: "Antidiabetics", qty: "360 tablets", price: "₹21,600" },
  { rank: 4, name: "Atorvastatin 10mg",   cat: "Cardiac",       qty: "280 tablets", price: "₹18,200" },
  { rank: 5, name: "Omeprazole 20mg",     cat: "Gastro",        qty: "240 capsules",price: "₹12,480" },
  { rank: 6, name: "Cetirizine 10mg",     cat: "Antihistamine", qty: "200 tablets", price: "₹8,400"  },
];

const prescriptions = [
  { id: "RX-4821", patient: "Rajesh Sharma",  doc: "Dr. A. Mehta",   status: "Verified",  date: "20 May" },
  { id: "RX-4820", patient: "Priya Iyer",     doc: "Dr. S. Kumar",   status: "Pending",   date: "20 May" },
  { id: "RX-4819", patient: "Arun Nair",      doc: "Dr. R. Joshi",   status: "Verified",  date: "19 May" },
  { id: "RX-4818", patient: "Sunita Patil",   doc: "Dr. M. Rao",     status: "Rejected",  date: "19 May" },
];

const aiAlerts = [
  { type: "Demand Spike",       icon: "", color: "#6366f1", bg: "#eef2ff", msg: "Monsoon season ahead — stock up on ORS, anti-diarrheals and anti-malarials. Demand up 40%." },
  { type: "Reorder Alert",      icon: "", color: "#f59e0b", bg: "#fffbeb", msg: "Paracetamol 500mg stock at 12-day cover. Recommended reorder: 500 strips today." },
  { type: "Scheme Opportunity", icon: "", color: "#10b981", bg: "#ecfdf5", msg: "Vitamin C range qualifies for an extra 3% margin if ordered before May 25." },
  { type: "Payment Reminder",   icon: "", color: "#ef4444", bg: "#fef2f2", msg: "₹12,800 overdue balance. Pay before May 22 to avoid credit limit suspension." },
];

const quickActions = [
  { icon: "", label: "Place Order",    id: "qa-order"   },
  { icon: "", label: "Track Orders",   id: "qa-track"   },
  { icon: "", label: "Upload Rx",      id: "qa-rx"      },
  { icon: "", label: "Pay Now",        id: "qa-pay"     },
  { icon: "", label: "View Ledger",    id: "qa-ledger"  },
  { icon: "", label: "My Schemes",     id: "qa-schemes" },
  { icon: "", label: "Download Invoice",id: "qa-invoice"},
];

const catalogueProducts = [
  { name: "Paracetamol 500mg",      price: 420,   unit: "per 100 strips" },
  { name: "Amoxicillin 500mg",      price: 700,   unit: "per 100 caps"   },
  { name: "Metformin 500mg",        price: 600,   unit: "per 100 tabs"   },
  { name: "Atorvastatin 10mg",      price: 650,   unit: "per 100 tabs"   },
  { name: "Omeprazole 20mg",        price: 520,   unit: "per 100 caps"   },
  { name: "Cetirizine 10mg",        price: 420,   unit: "per 100 tabs"   },
  { name: "Azithromycin 500mg",     price: 980,   unit: "per 100 tabs"   },
  { name: "Pantoprazole 40mg",      price: 560,   unit: "per 100 tabs"   },
  { name: "Cough Syrup 100ml",      price: 120,   unit: "per bottle"     },
  { name: "Vitamin C 500mg",        price: 380,   unit: "per 100 tabs"   },
  { name: "ORS Sachets",            price: 80,    unit: "per 10 sachets" },
  { name: "Anti-malarial Combo",    price: 1240,  unit: "per 10 strips"  },
];

const categoryData = [
  { label: "Analgesics",    value: 28, color: "#2563eb" },
  { label: "Antibiotics",   value: 22, color: "#7c3aed" },
  { label: "Antidiabetics", value: 18, color: "#06b6d4" },
  { label: "Cardiac",       value: 14, color: "#10b981" },
  { label: "Gastro",        value: 10, color: "#f59e0b" },
  { label: "Others",        value: 8,  color: "#94a3b8" },
];

const STATUS_STYLES = {
  Dispatched: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Pending:    { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Delivered:  { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Verified:   { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Rejected:   { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  Approved:   { bg: "#ede9fe", color: "#4c1d95", dot: "#8b5cf6" },
};

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

const el = id => document.getElementById(id);

function fmt(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(2)}K`;
  return `₹${n}`;
}

function statusChip(status) {
  const s = STATUS_STYLES[status] || { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return `<span class="status-chip" style="background:${s.bg};color:${s.color}">
    <span class="status-dot" style="background:${s.dot}"></span>${status}
  </span>`;
}

/* ══════════════════════════════════════════════════════════════
   DATE SUBTITLE
══════════════════════════════════════════════════════════════ */

function setDateSubtitle() {
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now    = new Date();
  const sub    = el("dateSubtitle");
  if (sub) sub.textContent =
    `Here's your store overview for today, ${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════════════════════ */

function initSidebar() {
  const navItems    = document.querySelectorAll(".nav-item");
  const navChildren = document.querySelectorAll(".nav-child");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      navChildren.forEach(c => c.classList.remove("active"));
      item.classList.add("active");

      const group = item.dataset.group;
      if (group) {
        const children = el(`group-${group}`);
        const arrow    = el(`arrow-${group}`);
        if (children) {
          const hidden = children.classList.toggle("hidden");
          if (arrow) arrow.classList.toggle("open", !hidden);
        }
      }
    });
  });

  navChildren.forEach(child => {
    child.addEventListener("click", e => {
      e.stopPropagation();
      navChildren.forEach(c => c.classList.remove("active"));
      navItems.forEach(i => i.classList.remove("active"));
      child.classList.add("active");
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════════════════════ */

function buildQuickActions() {
  const grid = el("quickActionsGrid");
  if (!grid) return;
  grid.innerHTML = quickActions.map(qa => `
    <div class="qa-btn" id="${qa.id}" role="button" tabindex="0">
      <div class="qa-icon">${qa.icon}</div>
      <div class="qa-label">${qa.label}</div>
    </div>
  `).join("");

  // Wire order / pay shortcuts
  el("qa-order")  ?.addEventListener("click", openOrderModal);
  el("qa-pay")    ?.addEventListener("click", () => showToast("💳 Redirecting to payment gateway…"));
  el("qa-invoice")?.addEventListener("click", () => showToast("📥 Invoice downloaded!"));
  el("qa-rx")     ?.addEventListener("click", () => showToast("📄 Rx upload coming soon."));
}

/* ══════════════════════════════════════════════════════════════
   PURCHASE TREND CHART
══════════════════════════════════════════════════════════════ */

function buildPurchaseChart() {
  const canvas = el("purchaseChart");
  if (!canvas) return;

  new Chart(canvas, {
    type: "line",
    data: {
      labels  : purchaseData.map(d => d.month),
      datasets: [
        {
          label          : "Purchases",
          data           : purchaseData.map(d => d.purchases),
          borderColor    : "#2563eb",
          borderWidth    : 2.5,
          pointRadius    : 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#2563eb",
          fill           : true,
          backgroundColor: ctx => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return "transparent";
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(37,99,235,0.2)");
            g.addColorStop(1, "rgba(37,99,235,0.01)");
            return g;
          },
          tension: 0.4,
        },
        {
          label          : "Payments",
          data           : purchaseData.map(d => d.payments),
          borderColor    : "#10b981",
          borderWidth    : 1.8,
          borderDash     : [5, 3],
          pointRadius    : 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#10b981",
          fill           : true,
          backgroundColor: ctx => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return "transparent";
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(16,185,129,0.12)");
            g.addColorStop(1, "rgba(16,185,129,0.01)");
            return g;
          },
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff", borderColor: "#e8eaf2", borderWidth: 1,
          titleColor: "#0f1629", bodyColor: "#374151",
          padding: 10, cornerRadius: 8,
          callbacks: {
            label: ctx => ` ₹${(ctx.parsed.y / 100000).toFixed(2)}L`,
          },
        },
      },
      scales: {
        x: {
          grid  : { display: false }, border: { display: false },
          ticks : { color: "#9ca3af", font: { size: 10, family: "'Sora', sans-serif" } },
        },
        y: {
          grid  : { color: "#f1f5f9" }, border: { display: false },
          ticks : {
            color: "#9ca3af",
            font : { size: 10, family: "'Sora', sans-serif" },
            callback: v => `₹${(v / 100000).toFixed(0)}L`,
          },
        },
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════
   CATEGORY DONUT CHART
══════════════════════════════════════════════════════════════ */

function buildCategoryChart() {
  const canvas = el("categoryChart");
  if (!canvas) return;

  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels  : categoryData.map(d => d.label),
      datasets: [{
        data           : categoryData.map(d => d.value),
        backgroundColor: categoryData.map(d => d.color),
        borderWidth    : 2,
        borderColor    : "#fff",
        hoverOffset    : 4,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff", borderColor: "#e8eaf2", borderWidth: 1,
          titleColor: "#0f1629", bodyColor: "#374151",
          padding: 8, cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` },
        },
      },
    },
  });

  // Legend
  const legend = el("categoryLegend");
  if (legend) {
    legend.innerHTML = categoryData.map(d => `
      <div class="cat-leg-item">
        <div style="display:flex;align-items:center">
          <span class="cat-leg-dot" style="background:${d.color}"></span>
          <span style="color:#374151">${d.label}</span>
        </div>
        <span style="font-family:var(--mono);font-weight:700;font-size:10px;color:#0f1629">${d.value}%</span>
      </div>
    `).join("");
  }
}

/* ══════════════════════════════════════════════════════════════
   ORDERS TABLE
══════════════════════════════════════════════════════════════ */

let currentFilter = "all";

function buildOrdersTable(filter) {
  const tbody = el("ordersBody");
  if (!tbody) return;

  const rows = filter === "all"
    ? recentOrders
    : recentOrders.filter(o => o.status === filter);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--muted);font-size:12px">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(o => `
    <tr>
      <td><span class="ot-id">${o.id}</span></td>
      <td>
        <div class="ot-name">${o.name}</div>
        <div class="ot-sub">${o.qty}</div>
      </td>
      <td><span class="ot-amount">${fmt(o.amount)}</span></td>
      <td>${statusChip(o.status)}</td>
      <td style="font-size:11px;color:var(--muted)">${o.delivery}</td>
      <td>
        <button class="ot-action-btn">👁</button>
      </td>
    </tr>
  `).join("");
}

function initOrderFilters() {
  const tabs = document.querySelectorAll(".ftab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      buildOrdersTable(currentFilter);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   EXPIRY ALERTS
══════════════════════════════════════════════════════════════ */

function buildExpiryList() {
  const container = el("expiryList");
  if (!container) return;

  container.innerHTML = expiryAlerts.map(e => `
    <div class="expiry-item">
      <div>
        <div class="expiry-name">${e.name}</div>
        <div class="expiry-batch">${e.batch} · ${e.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;color:var(--muted)">${e.date}</span>
        <span class="expiry-badge exp-${e.risk}">${e.risk.charAt(0).toUpperCase() + e.risk.slice(1)}</span>
      </div>
    </div>
  `).join("");
}

/* ══════════════════════════════════════════════════════════════
   SCHEMES
══════════════════════════════════════════════════════════════ */

function buildSchemes() {
  const container = el("schemesList");
  if (!container) return;

  container.innerHTML = schemes.map(s => `
    <div class="scheme-item">
      <div class="scheme-ico">${s.icon}</div>
      <div style="flex:1">
        <div class="scheme-name">${s.name}</div>
        <div class="scheme-meta">${s.meta}</div>
      </div>
      <div class="scheme-save">${s.saving}</div>
    </div>
  `).join("");
}

/* ══════════════════════════════════════════════════════════════
   TOP PRODUCTS
══════════════════════════════════════════════════════════════ */

function buildTopProducts() {
  const container = el("topProductsList");
  if (!container) return;

  container.innerHTML = topProducts.map(p => `
    <div class="prod-item">
      <div class="prod-rank r${p.rank}">${p.rank}</div>
      <div style="flex:1">
        <div class="prod-name">${p.name}</div>
        <div class="prod-cat">${p.cat} · ${p.qty}</div>
      </div>
      <div class="prod-qty">${p.price}</div>
      <button class="prod-reorder">↻ Reorder</button>
    </div>
  `).join("");

  // Reorder buttons
  document.querySelectorAll(".prod-reorder").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      showToast(`✅ ${topProducts[i].name} added to cart!`);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   PRESCRIPTIONS
══════════════════════════════════════════════════════════════ */

function buildRxSection() {
  // Summary cards
  const rxGrid = el("rxGrid");
  if (rxGrid) {
    const verified = prescriptions.filter(r => r.status === "Verified").length;
    const pending  = prescriptions.filter(r => r.status === "Pending").length;
    rxGrid.innerHTML = `
      <div class="rx-card"><div class="rx-val" style="color:#2563eb">312</div><div class="rx-lbl">Uploaded (May)</div></div>
      <div class="rx-card"><div class="rx-val" style="color:#10b981">${verified + 280}</div><div class="rx-lbl">AI Verified</div></div>
      <div class="rx-card"><div class="rx-val" style="color:#f59e0b">${pending + 18}</div><div class="rx-lbl">Pending Review</div></div>
      <div class="rx-card"><div class="rx-val" style="color:#ef4444">14</div><div class="rx-lbl">Rejected</div></div>
    `;
  }

  // Recent Rx list
  const rxList = el("rxList");
  if (rxList) {
    rxList.innerHTML = prescriptions.map(r => `
      <div class="rx-item">
        <div>
          <div class="rx-patient">${r.patient}</div>
          <div class="rx-doc">${r.doc} · ${r.date}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="rx-id">${r.id}</span>
          ${statusChip(r.status)}
        </div>
      </div>
    `).join("");
  }
}

/* ══════════════════════════════════════════════════════════════
   AI ALERTS
══════════════════════════════════════════════════════════════ */

function buildAIAlerts() {
  const container = el("aiAlertsList");
  if (!container) return;

  container.innerHTML = aiAlerts.map(a => `
    <div class="alert-card" style="border-left:3px solid ${a.color};background:${a.bg}">
      <div class="alert-head" style="color:${a.color}">
        <span>${a.icon}</span><span>${a.type}</span>
      </div>
      <div class="alert-msg">${a.msg}</div>
    </div>
  `).join("");
}

/* ══════════════════════════════════════════════════════════════
   SEARCH (global — filters order table)
══════════════════════════════════════════════════════════════ */

function initSearch() {
  const input = el("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll("#ordersBody tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   PLACE ORDER MODAL
══════════════════════════════════════════════════════════════ */

let cartItems = [];
let orderProductSearch = "";

function openOrderModal() {
  cartItems = [];
  renderCartItems();
  el("orderModal").classList.remove("hidden");
  el("productSearch").value = "";
  el("productSuggestions").classList.add("hidden");
  setTimeout(() => el("productSearch").focus(), 50);
}

function closeOrderModal() {
  el("orderModal").classList.add("hidden");
}

function renderSuggestions(query) {
  const box = el("productSuggestions");
  if (!query.trim()) { box.classList.add("hidden"); return; }

  const matches = catalogueProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!matches.length) { box.classList.add("hidden"); return; }

  box.innerHTML = matches.slice(0, 6).map((p, i) => `
    <div class="suggestion-item" data-idx="${i}" data-name="${p.name}" data-price="${p.price}" data-unit="${p.unit}">
      <span>${p.name} <span style="font-size:10px;color:var(--muted)">(${p.unit})</span></span>
      <span class="sug-price">₹${p.price}</span>
    </div>
  `).join("");

  box.classList.remove("hidden");

  box.querySelectorAll(".suggestion-item").forEach(item => {
    item.addEventListener("click", () => {
      addToCart(item.dataset.name, Number(item.dataset.price));
      el("productSearch").value = "";
      box.classList.add("hidden");
    });
  });
}

function addToCart(name, price) {
  const existing = cartItems.find(i => i.name === name);
  if (existing) { existing.qty++; }
  else           { cartItems.push({ name, price, qty: 1 }); }
  renderCartItems();
}

function renderCartItems() {
  const box = el("cartItems");
  if (!box) return;

  if (!cartItems.length) {
    box.innerHTML = `<div class="cart-empty">No items added yet.</div>`;
    el("modalTotal").querySelector(".total-val").textContent = "₹0.00";
    return;
  }

  box.innerHTML = cartItems.map((item, i) => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-qty">
        <span class="qty-btn" data-action="dec" data-idx="${i}">−</span>
        <span class="qty-num">${item.qty}</span>
        <span class="qty-btn" data-action="inc" data-idx="${i}">+</span>
      </div>
      <span class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</span>
      <span class="cart-item-remove" data-idx="${i}">✕</span>
    </div>
  `).join("");

  // Qty buttons
  box.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx    = Number(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === "inc") { cartItems[idx].qty++; }
      else if (action === "dec") {
        cartItems[idx].qty--;
        if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
      }
      renderCartItems();
    });
  });

  // Remove buttons
  box.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      cartItems.splice(Number(btn.dataset.idx), 1);
      renderCartItems();
    });
  });

  // Total
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  el("modalTotal").querySelector(".total-val").textContent =
    `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function initOrderModal() {
  // Open buttons
  el("placeOrderBtn")  ?.addEventListener("click", openOrderModal);
  el("quickOrderBtn")  ?.addEventListener("click", openOrderModal);
  el("modalClose")     ?.addEventListener("click", closeOrderModal);
  el("modalCancel")    ?.addEventListener("click", closeOrderModal);
  el("payNowBtn")      ?.addEventListener("click", () => showToast("💳 Redirecting to payment gateway…"));
  el("downloadInvoiceBtn")?.addEventListener("click", () => showToast("📥 Invoice downloaded successfully!"));

  // Close on overlay click
  el("orderModal")?.addEventListener("click", e => {
    if (e.target === el("orderModal")) closeOrderModal();
  });

  // Product search
  el("productSearch")?.addEventListener("input", e => {
    renderSuggestions(e.target.value);
  });

  // Confirm order
  el("modalConfirm")?.addEventListener("click", () => {
    if (!cartItems.length) {
      showToast("⚠️ Please add at least one product.");
      return;
    }
    closeOrderModal();
    showToast(`✅ Order placed successfully! ${cartItems.length} item(s) ordered.`);
    cartItems = [];
  });
}

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */

let toastTimeout = null;

function showToast(msg) {
  const toast = el("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("hidden"), 3200);
}

/* ══════════════════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  setDateSubtitle();
  initSidebar();
  buildQuickActions();
  buildPurchaseChart();
  buildOrdersTable("all");
  initOrderFilters();
  buildExpiryList();
  buildSchemes();
  buildTopProducts();
  buildRxSection();
  buildAIAlerts();
  buildCategoryChart();
  initSearch();
  initOrderModal();
});