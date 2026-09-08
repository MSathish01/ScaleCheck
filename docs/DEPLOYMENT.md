# ScaleCheck — Deployment & Operations Guide

This guide details running **ScaleCheck** locally for evaluator demonstration in under 5 minutes, as well as containerized deployment for production.

---

## 1. Local Evaluator Quickstart (< 5 Minutes)

Zero external daemon dependencies are required in local development mode — SQLite handles persistence out of the box.

### Prerequisites:
- Node.js v18+ (v20 or v22 recommended)
- npm v9+

### Step 1: Install & Seed Database
From the project root:
```bash
# 1. Setup Backend
cd backend
npm install
npx prisma db push
npm run seed
npm run build

# 2. Setup Frontend Web
cd ../frontend
npm install
npm run build

# 3. Setup Mobile Field App
cd ../mobile
npm install
npm run build
```

### Step 2: Run Services Concurrently
Open 3 terminal tabs (or use background runners):

- **Terminal 1 (Backend API :5000):**
  ```bash
  cd backend
  npm run dev
  ```

- **Terminal 2 (Frontend Web Portal :5173):**
  ```bash
  cd frontend
  npm run dev
  ```

- **Terminal 3 (Mobile Offline Field App :5174):**
  ```bash
  cd mobile
  npm run dev
  ```

### Access URLs:
- **Public Crowd-Verify Portal:** [http://localhost:5173/verify](http://localhost:5173/verify)
- **Web App:** [http://localhost:5173](http://localhost:5173)
- **Mobile Field App:** [http://localhost:5174](http://localhost:5174)
- **Backend API Health:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 2. Production Deployment via Docker Compose

In production or staging, ScaleCheck deploys with a dedicated PostgreSQL database container and Nginx frontend proxy.

```bash
# Start all containers in background
docker compose up -d --build

# View real-time logs
docker compose logs -f backend
```

---

## 3. Pre-Seeded Hackathon Demo Accounts

| Role | Email | Password | Primary Demo Capability |
|:---|:---|:---|:---|
| **Central Admin (DoCA)** | `doca.admin@nic.in` | `Admin@123` | National command center, adversarial tamper test, ledger audit |
| **State Admin (Puducherry)** | `py.admin@gov.in` | `Admin@123` | Statewide compliance, district pendency, job allocation |
| **Legal Metrology Officer (LMO)** | `lmo.puducherry@gov.in` | `Officer@123` | Queue scheduling, inspection observation recording, cert issuance |
| **GATC Test Centre** | `gatc.south@testlab.org` | `Gatc@123` | Test centre calibration, lab test records |
| **Trader (Petrol Pump)** | `trader.petrol@puducherry.in` | `Trader@123` | Fuel dispenser re-verification, certificate download |
| **Trader (Grain Mandi)** | `trader.mandi@chennai.com` | `Trader@123` | Platform scale, early renewal incentive discount |
| **Trader (Jeweller)** | `trader.jewels@bengaluru.in` | `Trader@123` | Class I micro-balance, predictive wear alert |
