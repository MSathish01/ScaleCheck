# ScaleCheck — Smart Legal Metrology Verification & Tamper-Proof Certification System

[![Ministry](https://img.shields.io/badge/Ministry-Consumer%20Affairs%2C%20Food%20%26%20Public%20Distribution-blue.svg)](https://consumeraffairs.nic.in)
[![Department](https://img.shields.io/badge/Department-Consumer%20Affairs%20(DoCA)-orange.svg)](https://consumeraffairs.nic.in)
[![Act](https://img.shields.io/badge/Statutory%20Act-Legal%20Metrology%20Act%2C%202009-darkgreen.svg)](https://consumeraffairs.nic.in)
[![Cryptographic Signing](https://img.shields.io/badge/Security-RSA--2048%20%2F%20Ed25519%20Signed-emerald.svg)]()
[![Audit Trail](https://img.shields.io/badge/Ledger-SHA--256%20Hash--Chained-indigo.svg)]()

---

## 🏛️ Executive Summary

Under the **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011**, every commercial weighing and measuring instrument (electronic scales, fuel dispensers, flow meters, weighbridges, storage tanks) must be periodically verified and stamped by Legal Metrology Officers (LMOs) or Government Approved Test Centres (GATCs).

**ScaleCheck** replaces fragmented, paper-based, and forgeable certificate practices with a government-grade digital ecosystem featuring:
1. **Asymmetric Cryptographically Signed Certificates** (Anti-counterfeiting & crowd-verify via QR).
2. **Blockchain-Inspired Append-Only Verification Ledger** (Mathematical non-repudiation & live tamper detection).
3. **Offline-First Field Officer App** (Zero-connectivity field mandis supported with local IndexedDB & background sync).
4. **Predictive Wear & Drift Engine** (Rules-based early re-verification advisories and early renewal incentives).
5. **Multilingual & Voice Assistance Layer** (English, Hindi, and Tamil with Web Speech API audio synthesis).

---

## 🚀 Quickstart (< 5 Minutes)

### 1. Install & Seed
```bash
# Setup Backend
cd backend
npm install
npx prisma db push
npm run seed

# Setup Frontend
cd ../frontend
npm install

# Setup Mobile Field App
cd ../mobile
npm install
```

### 2. Run Services
In 3 separate terminals:
```bash
# Terminal 1: Backend API (Port 5000)
cd backend && npm run dev

# Terminal 2: Web Portal (Port 5173)
cd frontend && npm run dev

# Terminal 3: Mobile Field App (Port 5174)
cd mobile && npm run dev
```

### 3. URLs
- **Web Portal:** [http://localhost:5173](http://localhost:5173)
- **Public Crowd-Verify QR:** [http://localhost:5173/verify](http://localhost:5173/verify)
- **Mobile Field App:** [http://localhost:5174](http://localhost:5174)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 👥 Demo Pre-Seeded Accounts

| Stakeholder Role | Email | Password |
|:---|:---|:---|
| **Central Admin (DoCA)** | `doca.admin@nic.in` | `Admin@123` |
| **State Admin (Puducherry)** | `py.admin@gov.in` | `Admin@123` |
| **Legal Metrology Officer (LMO)** | `lmo.puducherry@gov.in` | `Officer@123` |
| **GATC Test Centre** | `gatc.south@testlab.org` | `Gatc@123` |
| **Trader (Petrol Pump)** | `trader.petrol@puducherry.in` | `Trader@123` |
| **Trader (Grain Mandi)** | `trader.mandi@chennai.com` | `Trader@123` |
| **Trader (Jewellery)** | `trader.jewels@bengaluru.in` | `Trader@123` |

*Quick test certificate ID for Public Verify:* **`DOCA-PY-2026-00101`**

---

## 📁 Repository Structure

```
SIH-26036/
├── backend/                  # Node.js + TypeScript + Express + Prisma (SQLite/PostgreSQL)
│   ├── src/
│   │   ├── config/           # App and crypto configuration
│   │   ├── controllers/      # Auth, Instruments, Applications, Inspections, Certs, Ledger
│   │   ├── middleware/       # JWT Auth, RBAC guards
│   │   ├── services/         # CryptoService, LedgerService, PdfService, PredictiveService
│   │   ├── routes/           # REST endpoints
│   │   └── server.ts         # Express server entry point
│   ├── prisma/               # Schema, migrations & seed script
│   └── tests/                # Automated cryptographic & ledger test suite
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Navbar, VoiceAssistant, LedgerViewerModal
│   │   ├── pages/            # Public Verify, Trader, LMO, GATC, State Admin, Central Admin
│   │   ├── i18n/             # English, Hindi, Tamil translations
│   │   └── services/         # Axios API client
├── mobile/                   # Offline-first Field Verification App (PWA)
│   ├── src/
│   │   ├── db/               # Dexie IndexedDB local schema
│   │   ├── services/         # Offline sync & queue manager
│   │   └── App.tsx           # Mobile inspection client
├── docs/                     # Technical architecture, security, ERD, deployment
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL + Backend + Frontend)
├── PROGRESS.md               # Phase-by-phase implementation tracker
├── SCRIPT.md                 # Complete 5-minute evaluator demonstration walkthrough
└── README.md
```

---

## 📖 Detailed Documentation
- [System Architecture](docs/ARCHITECTURE.md)
- [Cryptographic Security & Tamper Evidence](docs/SECURITY.md)
- [Database Entity Relationship Diagram](docs/ERD.md)
- [Production & Cloud Deployment](docs/DEPLOYMENT.md)
- [Evaluator Walkthrough Script](SCRIPT.md)
