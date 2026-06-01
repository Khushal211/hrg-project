// routes/transactions.js
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/transactions
router.get('/', (req, res) => {
  const { type, mat_id, limit = 200 } = req.query;
  let sql = `
    SELECT t.*, m.name as mat_name, m.unit as mat_unit
    FROM transactions t
    LEFT JOIN materials m ON t.mat_id = m.id
  `;
  const params = [];
  const wheres = [];
  if (type) { wheres.push('t.type = ?'); params.push(type); }
  if (mat_id) { wheres.push('t.mat_id = ?'); params.push(mat_id); }
  if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ');
  sql += ` ORDER BY t.date DESC, t.id DESC LIMIT ?`;
  params.push(parseInt(limit));
  res.json(db.prepare(sql).all(...params));
});

// POST /api/transactions  (Stock In or Stock Out)
router.post('/', (req, res) => {
  const { type, mat_id, qty, details, project, date } = req.body;
  if (!type || !mat_id || !qty) return res.status(400).json({ error: 'type, mat_id, qty required' });
  if (!['Stock In', 'Stock Out'].includes(type)) return res.status(400).json({ error: 'type must be Stock In or Stock Out' });

  const mat = db.prepare('SELECT * FROM materials WHERE id = ?').get(mat_id);
  if (!mat) return res.status(404).json({ error: 'Material not found' });

  const q = parseFloat(qty);
  if (type === 'Stock Out' && mat.qty < q) {
    return res.status(400).json({ error: `Insufficient stock. Available: ${mat.qty} ${mat.unit}` });
  }

  // Update material qty
  const newQty = type === 'Stock In' ? mat.qty + q : mat.qty - q;
  db.prepare('UPDATE materials SET qty=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(newQty, mat_id);

  // Insert transaction
  const result = db.prepare(`
    INSERT INTO transactions (type, mat_id, qty, details, project, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, mat_id, q, details || '', project || '', date || new Date().toISOString().slice(0,10));

  const created = db.prepare(`
    SELECT t.*, m.name as mat_name, m.unit as mat_unit
    FROM transactions t LEFT JOIN materials m ON t.mat_id = m.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ transaction: created, new_qty: newQty });
});

// DELETE /api/transactions/:id  (admin only — reverses qty)
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!txn) return res.status(404).json({ error: 'Not found' });

  const mat = db.prepare('SELECT * FROM materials WHERE id = ?').get(txn.mat_id);
  if (mat) {
    const reversed = txn.type === 'Stock In' ? mat.qty - txn.qty : mat.qty + txn.qty;
    db.prepare('UPDATE materials SET qty=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(Math.max(0, reversed), txn.mat_id);
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
