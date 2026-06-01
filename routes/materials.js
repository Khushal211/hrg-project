// routes/materials.js
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/materials
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM materials ORDER BY name').all();
  res.json(rows);
});

// GET /api/materials/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST /api/materials
router.post('/', (req, res) => {
  const { name, category, unit, qty, min_qty, rate, supplier, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO materials (name, category, unit, qty, min_qty, rate, supplier, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    category || 'Other',
    unit || 'Pieces',
    parseFloat(qty) || 0,
    parseFloat(min_qty) || 50,
    parseFloat(rate) || 0,
    supplier || '',
    notes || ''
  );
  const created = db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/materials/:id
router.put('/:id', (req, res) => {
  const { name, category, unit, qty, min_qty, rate, supplier, notes } = req.body;
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare(`
    UPDATE materials SET name=?, category=?, unit=?, qty=?, min_qty=?, rate=?, supplier=?, notes=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name ?? existing.name,
    category ?? existing.category,
    unit ?? existing.unit,
    parseFloat(qty) ?? existing.qty,
    parseFloat(min_qty) ?? existing.min_qty,
    parseFloat(rate) ?? existing.rate,
    supplier ?? existing.supplier,
    notes ?? existing.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id));
});

// DELETE /api/materials/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
