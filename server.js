// server.js — HRG Smart Inventory Pro
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/materials',    require('./routes/materials'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/suppliers',    require('./routes/suppliers'));
app.use('/api/dashboard',    require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'HRG Smart Inventory Pro', version: '2.0.0' }));

// Fallback: serve index.html for all non-API routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🏗  HRG Smart Inventory Pro`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
