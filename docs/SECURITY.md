# ScaleCheck — Security & Cryptographic Verification Framework

**Issuing Authority:** Ministry of Consumer Affairs, Food & Public Distribution (DoCA)  
**Security Level:** Government-grade statutory e-Governance  

---

## 1. Asymmetric Cryptographic Signing (Anti-Counterfeit Protection)

Paper certificates and physical stamping marks in India have historically suffered from illegal embossing and counterfeit documents. **ScaleCheck** introduces an asymmetric cryptographic seal for every issued certificate.

### Algorithm Specification:
- **Key Type:** RSA-2048 (or Ed25519)
- **Signature Algorithm:** `SHA256withRSA` (PKCS#1 v1.5 / PSS)
- **Key Fingerprint:** `DOCA-LM-ROOT-KEY-2026`
- **Public Key Endpoint:** `GET /api/v1/analytics/public-key`

### Canonical Payload Construction:
To prevent signature ambiguity, certificate attributes are canonicalized with lexicographically sorted keys:
```json
{
  "accuracyClass": "CLASS_III",
  "capacity": "150 kg",
  "certificateNumber": "DOCA-PY-2026-00101",
  "inspectionResult": "PASS",
  "instrumentCategory": "NAWI_ELECTRONIC",
  "instrumentSerial": "FD-MIDCO-PY-55018",
  "issueDate": "2026-02-10T11:30:00.000Z",
  "issuingOfficerId": "cm...lmo",
  "securitySealNumber": "PY-DOCA-SL-99412",
  "validityExpiryDate": "2027-02-09T23:59:59.000Z"
}
```

$$\text{payloadHash} = \text{SHA-256}(\text{canonicalString})$$
$$\text{digitalSignature} = \text{Sign}_{\text{PrivateKey}}(\text{canonicalString})$$

---

## 2. Crowd-Verify QR Code Architecture

Every issued PDF certificate and trader physical sticker embeds a high-correction (Level H) QR code.

### Security Guarantees:
1. **Live State Verification:** The QR code does *not* merely store static text. Instead, scanning the QR opens:
   `https://scalecheck.gov.in/verify/:certNumber`
2. **Tamper Detection:** The server re-fetches the database record, reconstructs the canonical string, and verifies it with the public key:
   $$\text{Verify}_{\text{PublicKey}}(\text{canonicalString}, \text{digitalSignature}) = \text{TRUE}$$
3. **If any field is altered** (e.g. forged capacity, altered validity date, or stolen seal number), the cryptographic equation evaluates to **FALSE**, instantly flashing a high-visibility **COUNTERFEIT WARNING**.

---

## 3. Append-Only Verification Ledger (Blockchain-Inspired)

ScaleCheck records every statutory lifecycle event into an append-only, hash-chained ledger table (`verification_ledger`).

### Sequential Mathematical Chaining:
For every block $N \ge 2$:
$$\text{RecordHash}_N = \text{SHA-256}\Big(\text{Seq}_N \parallel \text{RecordHash}_{N-1} \parallel \text{EventType}_N \parallel \text{EntityId}_N \parallel \text{Payload}_N \parallel \text{Timestamp}_N\Big)$$

### Mathematical Immutability Guarantee:
- If an adversary accesses the database and alters any past inspection result, fee, or seal number in block $k$:
  $$\text{SHA-256}(\text{ModifiedPayload}_k) \neq \text{RecordHash}_k$$
  $$\text{PreviousHash}_{k+1} \neq \text{RecordHash}_k$$
- The automated chain validator traverses the ledger from sequence 1 to tip in milliseconds, flagging the exact sequence number where the tamper occurred.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Trader | LMO Officer | GATC Centre | State Admin | Central Admin | Public (No Login) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /certificates/verify/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | **✅ Allowed** |
| `POST /instruments` (Register) | **✅ Allowed** | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /applications` (Apply) | **✅ Allowed** | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /applications/allocate` | ❌ | ❌ | ❌ | **✅ Allowed** | **✅ Allowed** | ❌ |
| `POST /inspections/record` | ❌ | **✅ Allowed** | **✅ Allowed** | ❌ | ❌ | ❌ |
| `POST /certificates/issue` | ❌ | **✅ Allowed** | **✅ Allowed** | ❌ | ❌ | ❌ |
| `GET /ledger/validate` | ❌ | ✅ | ✅ | ✅ | **✅ Allowed** | ❌ |
| `POST /ledger/simulate-tamper` | ❌ | ❌ | ❌ | ❌ | **✅ Allowed** | ❌ |
