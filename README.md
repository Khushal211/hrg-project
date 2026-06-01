# HRG Smart Inventory Pro v2.0

A full-stack construction material inventory management system built with Node.js, Express, and SQLite.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + HTTP-only cookies |
| Frontend | Vanilla JS + Chart.js |
| Deployment | Railway |

---

## Project Structure

```
hrg-inventory/
├── server.js              # Main Express server
├── db.js                  # SQLite schema + seed data
├── package.json
├── Procfile               # Railway deployment
├── .env                   # Environment variables
├── middleware/
│   └── auth.js            # JWT auth middleware
├── routes/
│   ├── auth.js            # Login / logout / me
│   ├── materials.js       # CRUD for materials
│   ├── transactions.js    # Stock In / Stock Out
│   ├── suppliers.js       # CRUD for suppliers
│   └── dashboard.js       # Stats API
└── public/
    └── index.html         # Frontend SPA
```

---

## Local Setup

### Step 1 — Install dependencies
```bash
cd hrg-inventory
npm install
```

### Step 2 — Start the server
```bash
npm start
```

### Step 3 — Open in browser
```
http://localhost:3000
```

### Default Login Credentials
| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin |
| manager | hrg2024 | Manager |
| staff | staff123 | Staff |

---

## API Endpoints

### Auth
```
POST   /api/auth/login       Login
POST   /api/auth/logout      Logout
GET    /api/auth/me          Get current user
```

### Materials
```
GET    /api/materials        Get all materials
POST   /api/materials        Add material
PUT    /api/materials/:id    Update material
DELETE /api/materials/:id    Delete material
```

### Transactions
```
GET    /api/transactions     Get all transactions
POST   /api/transactions     Record Stock In / Stock Out
DELETE /api/transactions/:id Delete (admin only, reverses qty)
```

### Suppliers
```
GET    /api/suppliers        Get all suppliers
POST   /api/suppliers        Add supplier
PUT    /api/suppliers/:id    Update supplier
DELETE /api/suppliers/:id    Delete supplier
```

### Dashboard
```
GET    /api/dashboard/stats  Get summary stats
```

---

## Deployment on Railway (Free)

### Step 1 — Create GitHub repo
```bash
git init
git add .
git commit -m "Initial commit - HRG Smart Inventory Pro"
git remote add origin https://github.com/YOUR_USERNAME/hrg-inventory.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway auto-detects Node.js and deploys

### Step 3 — Set Environment Variables on Railway
In Railway dashboard → your project → Variables:
```
JWT_SECRET = your-strong-secret-here-change-this
NODE_ENV = production
```

### Step 4 — Get your live URL
Railway gives you a URL like: `https://hrg-inventory-production.up.railway.app`

---

## Features

- **Login system** with role-based access (admin / manager / staff)
- **SQLite database** — all data persists across sessions
- **Materials management** — add, edit, delete with CRUD API
- **Stock In / Stock Out** — updates database in real-time
- **Suppliers directory** — vendor management
- **AI Insights** — demand forecasting, reorder alerts
- **Cost Analytics** — charts, category breakdown, spend trends
- **Reports** — monthly summaries, CSV export
- **Activity Log** — full transaction history from DB
- **Dashboard** — live stats from database

---

## For Viva / Presentation

**What to say about backend:**
> "The backend is built on Node.js with Express framework, exposing a RESTful API. Authentication uses JWT tokens stored in HTTP-only cookies for security."

**What to say about database:**
> "We use SQLite as the database with better-sqlite3 driver. The schema has 4 tables — users, materials, suppliers, and transactions. SQLite was chosen for zero-configuration deployment while still providing full SQL capabilities."

**What to say about deployment:**
> "The application is deployed on Railway cloud platform, accessible via a public URL. The frontend is served as a static SPA from the Express server itself."
