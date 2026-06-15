/**
 * Fair Ford · Distributor Panel · app.js
 * Vanilla JS — no framework required.
 * Depends on: Chart.js (loaded via CDN in index.html)
 */

"use strict";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

const revenueData = [
  { month: "Dec", revenue: 980000,  orders: 820  },
  { month: "Jan", revenue: 1140000, orders: 940  },
  { month: "Feb", revenue: 1060000, orders: 870  },
  { month: "Mar", revenue: 1280000, orders: 1080 },
  { month: "Apr", revenue: 1420000, orders: 1190 },
  { month: "May", revenue: 1676430, orders: 1380 },
];

const territoryData = [
  { city: "Mumbai",     value: 98 },
  { city: "Pune",       value: 82 },
  { city: "Nagpur",     value: 74 },
  { city: "Nashik",     value: 61 },
  { city: "Aurangabad", value: 53 },
  { city: "Kolhapur",   value: 38 },
];

const recentOrders = [
  { id: "ORD-7821", retailer: "Maheshwari Medical", city: "Mumbai", items: 51, amount: 112450, status: "Dispatched", date: "20 May" },
  { id: "ORD-7820", retailer: "Shri Ram Pharma",    city: "Pune",   items: 3,  amount: 18200,  status: "Pending",    date: "20 May" },
  { id: "ORD-7819", retailer: "Laxmi Medical Store",city: "Nashik", items: 28, amount: 22800,  status: "Delivered",  date: "19 May" },
  { id: "ORD-7818", retailer: "Apollo Medicals",    city: "Nagpur", items: 7,  amount: 16750,  status: "Approved",   date: "19 May" },
  { id: "ORD-7817", retailer: "City Pharmacy",      city: "Mumbai", items: 31, amount: 18360,  status: "Dispatched", date: "18 May" },
  { id: "ORD-7816", retailer: "Health Plus Store",  city: "Pune",   items: 9,  amount: 5300,   status: "Delivered",  date: "18 May" },
];

const topRetailers = [
  { rank: 1, name: "Maheshwari Medical", orders: 46, amount: "₹91,24,208" },
  { rank: 2, name: "Apollo Medicals",    orders: 32, amount: "₹90,265"    },
  { rank: 3, name: "City Pharmacy",      orders: 28, amount: "₹87,108"    },
  { rank: 4, name: "Shri Ram Pharma",    orders: 19, amount: "₹73,500"    },
];

const schemes = [
  { name: "Buy 10 Get 1 — Paracetamol 500mg", retailers: 47,  expiry: "Sep 15" },
  { name: "Extra 5% Margin — Vitamins Range",  retailers: 124, expiry: "Sep 30" },
  { name: "Seasonal Scheme — Monsoon Meds",    retailers: 0,   expiry: "Sep 30" },
  { name: "Fast Moving — Antibiotics Bulk",    retailers: 301, expiry: "May 30" },
];

const aiAlerts = [
  { type: "Demand Forecast",     color: "#6366f1", bg: "#eef2ff", msg: "Paracetamol 500mg demand will spike 34% in next 2 weeks (monsoon season)." },
  { type: "Expiry Risk",         color: "#f59e0b", bg: "#fffbeb", msg: "17 SKUs expiring in <60 days. Suggest priority dispatch to 20 retailers." },
  { type: "Restock Suggestion",  color: "#10b981", bg: "#ecfdf5", msg: "Azithromycin 500mg is currently low. Recommended reorder: 5,000 units." },
  { type: "Territory Insight",   color: "#8b5cf6", bg: "#f5f3ff", msg: "Pune territory outperforming by 22%. Consider extra margin offer." },
];

const STATUS_STYLES = {
  Dispatched: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Pending:    { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Delivered:  { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Approved:   { bg: "#ede9fe", color: "#4c1d95", dot: "#8b5cf6" },
};

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

/** Format a number as ₹ shorthand */
function fmt(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(2)}K`;
  return `₹${n}`;
}

/** Safely get an element by ID */
function el(id) { return document.getElementById(id); }

/* ══════════════════════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════════════════════ */

function initSidebar() {
  const navItems = document.querySelectorAll(".nav-item");
  const navChildren = document.querySelectorAll(".nav-child");

  /* Top-level nav clicks */
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // Deactivate all
      navItems.forEach(i => i.classList.remove("active"));
      navChildren.forEach(c => c.classList.remove("active"));

      item.classList.add("active");

      // Handle expandable groups
      const group = item.dataset.group;
      if (group) {
        const children = el(`group-${group}`);
        const arrow    = el(`arrow-${group}`);
        if (children) {
          const isHidden = children.classList.toggle("hidden");
          arrow && arrow.classList.toggle("open", !isHidden);
        }
      }
    });
  });

  /* Child nav clicks */
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
   REVENUE CHART  (Chart.js dual-axis area chart)
══════════════════════════════════════════════════════════════ */

function buildRevenueChart() {
  const ctx = el("revenueChart");
  if (!ctx) return;

  const labels   = revenueData.map(d => d.month);
  const revenues = revenueData.map(d => d.revenue);
  const orders   = revenueData.map(d => d.orders);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label      : "Revenue",
          data       : revenues,
          yAxisID    : "yRev",
          borderColor: "#2563eb",
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#2563eb",
          fill       : true,
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "transparent";
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0,   "rgba(37,99,235,0.20)");
            gradient.addColorStop(1,   "rgba(37,99,235,0.01)");
            return gradient;
          },
          tension: 0.4,
        },
        {
          label      : "Orders",
          data       : orders,
          yAxisID    : "yOrd",
          borderColor: "#7c3aed",
          borderWidth: 1.5,
          borderDash : [5, 3],
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#7c3aed",
          fill       : true,
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "transparent";
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0,   "rgba(124,58,237,0.12)");
            gradient.addColorStop(1,   "rgba(124,58,237,0.01)");
            return gradient;
          },
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive         : true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          borderColor    : "#e8eaf2",
          borderWidth    : 1,
          titleColor     : "#0f1629",
          bodyColor      : "#2563eb",
          padding        : 10,
          cornerRadius   : 8,
          boxShadow      : "0 4px 12px rgba(0,0,0,0.08)",
          callbacks: {
            label(ctx) {
              if (ctx.dataset.label === "Revenue") {
                return ` ₹${(ctx.parsed.y / 100000).toFixed(2)}L`;
              }
              return ` ${ctx.parsed.y} orders`;
            },
          },
        },
      },
      scales: {
        x: {
          grid   : { display: false },
          border : { display: false },
          ticks  : { color: "#9ca3af", font: { size: 10, family: "'Sora', sans-serif" } },
        },
        yRev: {
          type    : "linear",
          position: "left",
          grid    : { color: "#f1f5f9", drawBorder: false },
          border  : { display: false },
          ticks   : {
            color   : "#9ca3af",
            font    : { size: 10, family: "'Sora', sans-serif" },
            callback: v => `₹${(v / 100000).toFixed(0)}L`,
          },
        },
        yOrd: {
          type    : "linear",
          position: "right",
          grid    : { display: false },
          border  : { display: false },
          ticks   : {
            color: "#9ca3af",
            font : { size: 10, family: "'Sora', sans-serif" },
          },
        },
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════
   TERRITORY BARS
══════════════════════════════════════════════════════════════ */

function buildTerritoryBars() {
  const container = el("territoryBars");
  if (!container) return;

  container.innerHTML = territoryData.map(t => `
    <div class="terr-row">
      <div class="terr-city">${t.city}</div>
      <div class="terr-track">
        <div class="terr-fill" style="width:0%" data-target="${t.value}"></div>
      </div>
      <div class="terr-val">${t.value}%</div>
    </div>
  `).join("");

  /* Animate bars on next frame */
  requestAnimationFrame(() => {
    container.querySelectorAll(".terr-fill").forEach(fill => {
      fill.style.width = fill.dataset.target + "%";
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   ORDERS TABLE
══════════════════════════════════════════════════════════════ */

function buildOrdersTable() {
  const tbody = el("ordersBody");
  if (!tbody) return;

  tbody.innerHTML = recentOrders.map(o => {
    const s = STATUS_STYLES[o.status] || { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
    return `
      <tr>
        <td><span class="ot-id">${o.id}</span></td>
        <td>
          <div class="ot-retailer">${o.retailer}</div>
          <div class="ot-city">${o.city} · ${o.items} items</div>
        </td>
        <td><span class="ot-amount">${fmt(o.amount)}</span></td>
        <td>
          <span class="status-chip" style="background:${s.bg};color:${s.color}">
            <span class="status-dot" style="background:${s.dot}"></span>
            ${o.status}
          </span>
        </td>
        <td style="color:#6b7280;font-size:11px">${o.date}</td>
        <td><button class="ot-action-btn">👁</button></td>
      </tr>
    `;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   TOP RETAILERS
══════════════════════════════════════════════════════════════ */

function buildTopRetailers() {
  const container = el("topRetailersList");
  if (!container) return;

  container.innerHTML = topRetailers.map(r => `
    <div class="ret-item">
      <div class="ret-rank top${r.rank}">${r.rank}</div>
      <div>
        <div class="ret-name">${r.name}</div>
        <div class="ret-orders">${r.orders} orders</div>
      </div>
      <div class="ret-amount">${r.amount}</div>
      <button class="ot-action-btn" style="margin-left:4px">→</button>
    </div>
  `).join("");
}

/* ══════════════════════════════════════════════════════════════
   UPHAAR SCHEMES
══════════════════════════════════════════════════════════════ */

function buildSchemes() {
  const container = el("schemesList");
  if (!container) return;

  container.innerHTML = schemes.map(s => `
    <div class="scheme-item">
      <div class="scheme-dot"></div>
      <div style="flex:1">
        <div class="scheme-name">${s.name}</div>
        <div class="scheme-meta">${s.retailers > 0 ? `${s.retailers} retailers` : "0 retailers"} · Exp: ${s.expiry}</div>
      </div>
      <div class="scheme-badge">Active</div>
    </div>
  `).join("");
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
        <span>${a.icon}</span>
        <span>${a.type}</span>
      </div>
      <div class="alert-msg">${a.msg}</div>
    </div>
  `).join("");
}

/* ══════════════════════════════════════════════════════════════
   ROLE PILL SWITCHER
══════════════════════════════════════════════════════════════ */

function initRolePills() {
  const pills = document.querySelectorAll(".role-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SEARCH  (live filter on orders table)
══════════════════════════════════════════════════════════════ */

function initSearch() {
  const input = el("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#ordersBody tr");
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   DATE SUBTITLE
══════════════════════════════════════════════════════════════ */

function setDateSubtitle() {
  const sub = el("dateSubtitle");
  if (!sub) return;
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date();
  sub.textContent = `Here's your territory overview for today, ${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ══════════════════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  setDateSubtitle();
  initSidebar();
  initRolePills();
  initSearch();
  buildTerritoryBars();
  buildOrdersTable();
  buildTopRetailers();
  buildSchemes();
  buildAIAlerts();
  buildRevenueChart();   /* Must come after DOM is ready */
});