# Smart India Hackathon (SIH) — Idea Proposal & Presentation Synopsis

## **Idea Title:** ScaleCheck — Smart Online Verification & Tamper-Proof Certification System for Legal Metrology
- **Ministry / Department:** Ministry of Consumer Affairs, Food & Public Distribution (Department of Consumer Affairs - DoCA)
- **Problem Category:** Software / e-Governance / Public Digital Infrastructure
- **Target Mandate:** Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011

---

## Slide 1: Problem Definition & Context
### Background & Challenges
In India, millions of commercial weighing and measuring instruments (grocery scales, petrol dispensers, tanker flow meters, weighbridges) require mandatory periodic verification under the **Legal Metrology Act, 2009**. The current system suffers from:
1. **Physical Paper Certificates & Seal Tampering:** Forged paper certificates and broken physical wire seals are hard for consumers or flying squads to verify on-spot.
2. **Offline Field Inspections in Remote/Rural Areas:** Legal Metrology Officers (LMOs) inspect remote mandis, petrol pumps, and rural markets where cellular connectivity is intermittent or unavailable.
3. **Revenue Leakage & Missed Re-verifications:** Lack of an automated expiry tracking and fee calculation engine leads to delayed re-verifications and lost government revenue.
4. **Zero Consumer Visibility:** Consumers buying goods have no way of knowing if the scale in front of them has been calibrated and officially certified.

---

## Slide 2: Proposed Solution
**ScaleCheck** is an end-to-end, multi-tier digital governance ecosystem designed for national scale:

1. **Role-Based Portals (Web & Mobile PWA):**
   - **Trader / Manufacturer Portal:** Instrument registration, instant fee calculation, renewal tracking, and grievance logging.
   - **LMO & GATC Inspection PWA:** Offline-first mobile field application for recording calibration tolerances, error margins (MPE), seal numbers, and GPS coordinates.
   - **Central & State Admin Command Centers:** Live surveillance dashboard tracking compliance percentage, district-level backlogs, and revenue collections.
   - **Public Citizen Crowd-Verification:** Zero-app-needed public QR verification scan enabling any citizen to audit calibration validity in seconds.

2. **Tamper-Proof Cryptographic Certification:**
   - Every verification certificate is digitally signed using **asymmetric RSA-2048 keys** and stamped with an immutable SHA-256 canonical hash.
   - Anchored into a sequential **SHA-256 Hash-Chained Verification Ledger**, providing blockchain-grade auditability without expensive mining or gas fees.

3. **Predictive Wear & Early Renewal Engine:**
   - Evaluates usage intensity, instrument age, and environmental risk factors to calculate a wear risk score ($0.0 - 1.0$), alerting traders before calibration drift occurs.

---

## Slide 3: Technical Architecture & System Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│  ┌──────────────────────────┐             ┌─────────────────────────┐  │
│  │     Trader & Admin       │             │   Field Officer PWA     │  │
│  │   React 18 + Tailwind    │             │ Offline Dexie/IndexedDB │  │
│  └────────────┬─────────────┘             └────────────┬────────────┘  │
└───────────────┼────────────────────────────────────────┼───────────────┘
                │ REST API                               │ Sync Flush
                ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & ENGINE TIER                       │
│                       Node.js + Express + TypeScript                   │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐   │
│   │ Cryptographic Core  │  │ Hash-Chained Ledger │  │ PDF & QR     │   │
│   │ RSA-2048 Asymmetric │  │ SHA-256 Prev-Hash   │  │ High Error-  │   │
│   │ Digital Signatures  │  │ Audit Chain         │  │ Correction   │   │
│   └─────────────────────┘  └─────────────────────┘  └──────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma ORM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE TIER                             │
│       PostgreSQL / SQLite Database  +  Tamper-Evident Ledger Log       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 4: Technology Stack

| Layer | Technologies Selected | Justification |
| :--- | :--- | :--- |
| **Web Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Fast rendering, responsive for desktop & mobile browsers, high accessibility. |
| **Field Mobile App** | Progressive Web App (PWA), Dexie.js (IndexedDB) | Operates 100% offline in rural mandis; automatically queues and synchronizes inspections when connectivity restores. |
| **Backend & API** | Node.js 22, Express.js, TypeScript | High-throughput asynchronous event loop suited for government transaction volumes. |
| **Database & ORM** | PostgreSQL / SQLite with Prisma ORM | Strong ACID compliance, strict typing, migration safety. |
| **Cryptography** | Node.js Native Crypto (RSA-2048, SHA-256) | Zero third-party cryptographic vulnerabilities; government-grade verification. |
| **Document Engine**| PDFKit, QRCode Generator | Generates official, printable DoCA certificates with tamper-proof QR codes. |

---

## Slide 5: Key Innovations & Novelty

1. **True Offline-First Field Operations:** Officers inspect weights in remote underground cellars or rural areas without dropping data. The app caches certificates, queues tests locally, and batch-syncs securely with cryptographic timestamp validation.
2. **Lightweight Hash-Chained Ledger:** Provides tamper-evident chronological proof of every inspection and issuance without the high computational cost, latency, or transaction fees of conventional public blockchains.
3. **Citizen Empowerment through Instant QR Verification:** Any consumer can point their phone camera at a shopkeeper's scale certificate QR code to verify validity, issuing officer name, and serial number in real time.
4. **Predictive Recalibration AI/Rules Engine:** Proactively notifies traders and officers before equipment exceeds Maximum Permissible Error (MPE), preventing accidental short-weighing penalties.
5. **Multilingual & Voice-Assisted Interface:** Supports English, Hindi, and Tamil with Web Speech API assistance for ground traders with varying digital literacy.

---

## Slide 6: Feasibility, Viability & Implementation Roadmap

- **Legal Compliance:** Built strictly to adhere to Schedule IX/XI format standards under the Legal Metrology (General) Rules, 2011.
- **Hardware Agnostic:** Zero proprietary hardware needed; works on existing smartphones, tablets, and laptops used by government staff.
- **Cost Effectiveness:** Built using standard open-source technologies, allowing state governments to host at minimal cloud infrastructure cost.

### 3-Phase Rollout Plan:
- **Phase 1 (Month 1–3):** State-level pilot in 2 districts (grocery mandis, fuel stations). Trader registration and LMO offline PWA deployment.
- **Phase 2 (Month 4–6):** Integration with State Treasury payment gateways and automated SMS/WhatsApp alerts; deployment to private accredited GATCs.
- **Phase 3 (Month 7–12):** National rollout across state metrology departments with DigiLocker certificate syncing and automated weighbridge IoT telemetry.

---

## Slide 7: Expected Impact

- **For Citizens:** Transparent transactions and immediate defense against short-weighing and counterfeit calibration seals.
- **For Traders:** Transparent fee calculations, early renewal discounts, paperless renewals, and no harassment from unauthorized inspectors.
- **For Government / DoCA:** Elimination of fake certificates, automated revenue collection, reduced inspection backlogs, and real-time oversight across all districts.
