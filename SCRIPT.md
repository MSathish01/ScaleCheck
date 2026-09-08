# ScaleCheck — Evaluator Demonstration Script (`SCRIPT.md`)

**Target Audience:** Smart India Hackathon (SIH) Evaluators / Ministry of Consumer Affairs Jury  
**Estimated Demo Time:** 5 – 7 Minutes  

---

## Pre-requisites & Verification
Make sure the backend is running on `http://localhost:5000` and frontend on `http://localhost:5173`.  
If running fresh, run `npm run seed` in `/backend`.

---

## 🎬 Act 1: Public Crowd-Verification via QR (The "Wow" Moment)
*Context: Under the Legal Metrology Act, 2009, consumer mistrust stems from forgeable paper certificates and fake physical stamps.*

1. Navigate to **[http://localhost:5173/verify](http://localhost:5173/verify)** (or click **"Public QR Verify"** in the top navbar).
2. Point out: **No login required** — any consumer or shopkeeper can verify instantaneously.
3. Click the pre-filled demo button: **`DOCA-PY-2026-00101`**.
4. **Observe the result:**
   - **Green Authenticity Seal:** *AUTHENTIC & CRYPTOGRAPHICALLY SEALED*
   - Algorithm: `SHA256withRSA`
   - Instrument details (Category: `FUEL_DISPENSER`, Serial: `FD-MIDCO-PY-55018`, Delivery Accuracy: `±0.2%`)
   - Working Standards & Physical Security Seal: `PY-DOCA-SL-99412`
   - Issuing Officer: *Inspector M. Anbarasan (Legal Metrology Officer, Puducherry)*
   - **Digital Proof Hash:** Displaying the raw SHA-256 cryptographic hash.
   - Click **"Download Official PDF Certificate"** &rarr; displays the government certificate with national emblem, dual decorative borders, officer signature block, and embedded high-correction QR code.
5. **Demonstrate Counterfeit Defense:**
   - Type or click **`FAKE-CERT-99999`** &rarr; instant high-visibility red counterfeit alert citing Section 30 of the Legal Metrology Act.

---

## 🎬 Act 2: Multilingual & Voice Assistance Layer
*Context: Commercial mandis, vegetable markets, and small traders across India include low-literacy users.*

1. In the top navbar, toggle between **EN**, **हिन्दी** (Hindi), and **தமிழ்** (Tamil).
2. Point out that all UI labels, roles, and statutory notices adapt seamlessly.
3. Click **"Voice Assist"** in the navbar:
   - The browser's Web Speech API automatically speaks aloud guidance instructions in the selected language.

---

## 🎬 Act 3: Trader Portal & Predictive Wear Engine
*Context: Traders face sudden penalties when scales drift out of calibration.*

1. Go to **[http://localhost:5173/login](http://localhost:5173/login)**.
2. Click the quick-credential pill **"Trader (Petrol)"** &rarr; automatically signs in as `trader.petrol@puducherry.in`.
3. **Observe Trader Dashboard:**
   - Gamified **"Early-Renewal Priority Incentive"** banner highlighting the 10% fee reduction for proactive compliance.
   - Look at the **"Registered Instruments & Stamping Status"** table.
   - Notice the **Live Wear Risk Score** (e.g. 18% - 45% Wear) and the advisory: *Rules-based engine analyzing usage intensity, load cell drift, and days remaining until statutory expiry.*
4. Click **"Register Instrument"** &rarr; register a new unit in seconds.
5. Click **"Apply Re-verification"** &rarr; submit a statutory verification request with automatic fee estimation.

---

## 🎬 Act 4: Field Officer (LMO) Inspection & Cryptographic Stamping
*Context: Legal Metrology Officers need a streamlined digital workbench to replace physical paper registers.*

1. Log out, go to `/login`, and click **"LMO Inspector"** (`lmo.puducherry@gov.in`).
2. **Observe the LMO Workbench:**
   - Shows active assigned jobs in Puducherry Zone 1.
   - Spot the pending weighbridge application **`APP-2026-00088`** (`WB-AVERY-PY-10882`).
3. Click **"Record Observation"**:
   - Visual checks: Markings intact.
   - Repeatability check: Nominal.
   - Enter MPE limit `0.2` and observed error `0.04`.
   - Test weights: *Class F1 Stamped Standards*.
   - Security Seal: *DOCA-SL-94021*.
   - Result: `PASS`.
   - Submit inspection observation.
4. **Issue Cryptographically Signed Certificate:**
   - Click **"Issue Certificate"**.
   - Watch the backend compute the canonical JSON, generate an RSA-2048 asymmetric signature, render the official PDF certificate with embedded QR, and append the record to the append-only ledger!

---

## 🎬 Act 5: Offline-First Mobile Field App
*Context: Field officers inspect remote rural mandis and highway fuel pumps with zero cellular signal.*

1. Open the mobile field app in a new tab: **[http://localhost:5174](http://localhost:5174)**.
2. Notice the smartphone interface designed specifically for touch devices.
3. Tap the connectivity toggle to switch to **`OFFLINE (Field)`** mode (simulating zero internet).
4. Tap **"Perform Field Inspection"** on an assigned job:
   - Fill in observed errors and seal number.
   - Tap **"Capture Seal Photo"** (geo-tagged photo capture simulation).
   - Tap **"Save Inspection"**.
5. **Notice:** The inspection is securely committed to the device's local **IndexedDB** database with `PENDING` sync status!
6. Toggle connectivity back to **`ONLINE`** &rarr; tap **"Sync Now"**.
7. Watch the local queue flush to the Central Government ledger with zero data loss!

---

## 🎬 Act 6: Central Admin (DoCA) & Adversarial Ledger Tamper Test
*Context: How do we mathematically prove records cannot be altered by rogue insiders?*

1. Back on the web portal, log in as **"Central Admin"** (`doca.admin@nic.in`).
2. **DoCA National Command Center:**
   - National compliance rate across all States & UTs.
   - Category distribution (scales, fuel dispensers, weighbridges).
3. Scroll to the **"Blockchain-Inspired Tamper-Evident Verification Ledger"** section:
   - Notice the status: **`CHAIN INTEGRITY VERIFIED (Mathematical Proof Intact)`**.
   - Shows sequential SHA-256 chained hashes ($H_N = \text{SHA256}(H_{N-1} + \dots)$).
4. **Execute Live Attack Demonstration:**
   - Click the red button: **"Simulate Adversarial Tamper"**.
   - The system simulates an unauthorized intruder directly modifying block #2's payload in the database.
   - **Immediately observe the result:**
     The chain validator catches the anomaly in real time:
     `INTEGRITY VIOLATION DETECTED: Block payload tampering detected at block #2!`
5. Click **"Restore Chain"** to re-hash and mathematically heal the ledger.

---

## Summary of Evaluator Key Takeaways
1. **Statutory Alignment:** 100% compliant with Legal Metrology Act, 2009 & General Rules, 2011.
2. **Tamper-Proof:** Cryptographically signed certificates + SHA-256 hash-chained ledger.
3. **Inclusive:** Offline-first field app + English/Hindi/Tamil voice assistance.
4. **Proactive:** Predictive wear risk alerts + early-renewal incentive discounts.
