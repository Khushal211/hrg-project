// routes/dashboard.js
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const materials = db.prepare('SELECT * FROM materials').all();
  const total = materials.length;
  const low   = materials.filter(m => m.qty > 0 && m.qty < m.min_qty).length;
  const out   = materials.filter(m => m.qty === 0).length;
  const value = materials.reduce((s, m) => s + m.qty * m.rate, 0);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTxns = db.prepare(`SELECT * FROM transactions WHERE date LIKE ?`).all(`${thisMonth}%`);
  const siQty = monthTxns.filter(t => t.type === 'Stock In').reduce((s, t) => s + t.qty, 0);
  const soQty = monthTxns.filter(t => t.type === 'Stock Out').reduce((s, t) => s + t.qty, 0);

  // Monthly transaction counts for last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthlyData = months.map(m => {
    const txns = db.prepare(`SELECT * FROM transactions WHERE date LIKE ?`).all(`${m}%`);
    return {
      month: m,
      stock_in:  txns.filter(t => t.type === 'Stock In').length,
      stock_out: txns.filter(t => t.type === 'Stock Out').length,
    };
  });

  // Category breakdown
  const catMap = {};
  materials.forEach(m => { catMap[m.category] = (catMap[m.category]||0) + m.qty * m.rate; });

  // Alerts
  const alerts = materials
    .filter(m => m.qty < m.min_qty)
    .map(m => ({ ...m, status: m.qty === 0 ? 'out' : 'low' }));

  res.json({ total, low, out, value, monthTxns: monthTxns.length, siQty, soQty, monthlyData, catMap, alerts });
});

module.exports = router;
