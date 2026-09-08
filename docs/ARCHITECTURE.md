# ScaleCheck — System Architecture & Data Flow

**Organization:** Ministry of Consumer Affairs, Food & Public Distribution (Department of Consumer Affairs - DoCA)  
**Legal Mandate:** Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011  

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Clients Layer"
        TraderWeb["Trader Web Portal<br/>(React + Vite)"]
        OfficerApp["Field Officer Mobile App<br/>(Offline-First PWA + IndexedDB)"]
        AdminPortal["DoCA National Command & State Admin<br/>(React + Vite)"]
        PublicCitizen["Public / Consumer<br/>(Any Smartphone QR Camera)"]
    end

    subgraph "API Gateway & Security Layer"
        ExpressAPI["Express API Gateway (:5000)<br/>(JWT Auth, RBAC Guards, CORS)"]
        CryptoEngine["Cryptographic Signing Engine<br/>(RSA-2048 / Ed25519 Asymmetric Keys)"]
        LedgerEngine["Verification Ledger Engine<br/>(SHA-256 Hash-Chained Append-Only)"]
        PdfGenerator["PDF Certificate Service<br/>(PDFKit + High-Correction QR)"]
        PredictiveEngine["Predictive Wear Engine<br/>(Rules-based tolerance drift analysis)"]
    end

    subgraph "Persistence Layer"
        RelationalDB[(Relational DB / SQLite / PostgreSQL)]
        LedgerTable[(Append-Only verification_ledger Table)]
        FileStore[("Signed PDF Storage (/uploads)")]
    end

    TraderWeb --> ExpressAPI
    OfficerApp -->|Online or Sync Flush| ExpressAPI
    AdminPortal --> ExpressAPI
    PublicCitizen -->|GET /api/v1/certificates/verify/:id| ExpressAPI

    ExpressAPI --> CryptoEngine
    ExpressAPI --> LedgerEngine
    ExpressAPI --> PdfGenerator
    ExpressAPI --> PredictiveEngine

    ExpressAPI --> RelationalDB
    LedgerEngine --> LedgerTable
    PdfGenerator --> FileStore
```

---

## 2. End-to-End Verification Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Trader as Trader / Instrument Owner
    actor Admin as State Admin
    actor LMO as Legal Metrology Officer
    participant API as ScaleCheck Backend
    participant Crypto as Crypto & Ledger Engine
    actor Consumer as Public / Consumer

    Trader->>API: 1. Register Instrument (EPS-2026-PY-1082)
    API->>Crypto: Write INSTRUMENT_REGISTERED to Ledger
    Trader->>API: 2. Submit Verification Application
    API->>Crypto: Write APPLICATION_SUBMITTED to Ledger
    Admin->>API: 3. Allocate Application to Jurisdictional LMO
    API->>Crypto: Write JOB_ALLOCATED to Ledger
    LMO->>API: 4. Schedule on-site verification visit
    LMO->>API: 5. Record Inspection Observations (Test Weights, MPE, Seal #)
    API->>Crypto: Write INSPECTION_COMPLETED to Ledger
    LMO->>API: 6. Trigger Certificate Issuance
    API->>Crypto: Sign canonical payload with RSA-2048 private key
    API->>Crypto: Generate PDF with embedded Crowd-Verify QR
    API->>Crypto: Write CERTIFICATE_ISSUED to Ledger
    API-->>Trader: Send SMS/Email with Download Link
    Consumer->>API: 7. Scan QR Code via smartphone camera
    API->>Crypto: Verify digital signature against public key
    API-->>Consumer: Display live Authentic / Counterfeit status badge
```

---

## 3. Offline-First Mobile Synchronization Flow

1. **Before field visits:** The Legal Metrology Officer taps **"Download Today's Assigned Queue"** while at the departmental office.
2. **In the field (Rural Mandi / Petrol Pump):** Even with zero cellular coverage (`OFFLINE` mode), the officer:
   - Tests accuracy using certified working standard weights.
   - Records observed errors and physical lead seal numbers.
   - Captures geo-tagged photo evidence.
   - Caches the record with a client-generated UUID into browser IndexedDB (Dexie.js).
3. **Back online:** The synchronization engine detects cellular signal (or manual **"Sync Now"**), flushes queued inspections via `POST /api/v1/inspections/sync-offline`, resolves any optimistic conflicts, and anchors the records into the national ledger.
