// routes/suppliers.js
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/suppliers
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all());
});

// POST /api/suppliers
router.post('/', (req, res) => {
  const { name, contact, phone, category, rating, lead_days, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare(`
    INSERT INTO suppliers (name, contact, phone, category, rating, lead_days, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, contact||'', phone||'', category||'', parseInt(rating)||3, parseInt(lead_days)||5, notes||'');
  res.status(201).json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/suppliers/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { name, contact, phone, category, rating, lead_days, notes } = req.body;
  db.prepare(`
    UPDATE suppliers SET name=?, contact=?, phone=?, category=?, rating=?, lead_days=?, notes=? WHERE id=?
  `).run(
    name??existing.name, contact??existing.contact, phone??existing.phone,
    category??existing.category, parseInt(rating)??existing.rating,
    parseInt(lead_days)??existing.lead_days, notes??existing.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id));
});

// DELETE /api/suppliers/:id
router.delete('/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM suppliers WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
