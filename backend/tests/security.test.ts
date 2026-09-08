import { CryptoService } from '../src/services/CryptoService';
import { LedgerService } from '../src/services/LedgerService';
import { PredictiveService } from '../src/services/PredictiveService';

describe('ScaleCheck Security & Cryptography Verification Suite', () => {
  beforeAll(() => {
    CryptoService.initializeKeys();
  });

  test('Cryptographic Signature: Should sign canonical payload and verify successfully', () => {
    const canonicalPayload = {
      certificateNumber: 'DOCA-TEST-2026-00001',
      instrumentSerial: 'TEST-SERIAL-100',
      capacity: '50 kg',
      accuracyClass: 'CLASS_III',
      validityExpiryDate: '2027-01-01T00:00:00.000Z'
    };

    const { signature, payloadHash } = CryptoService.signPayload(canonicalPayload);

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(50);
    expect(payloadHash).toHaveLength(64); // SHA-256 is 64 hex characters

    // Verify valid payload
    const isValid = CryptoService.verifySignature(canonicalPayload, signature);
    expect(isValid).toBe(true);

    // Tampered payload must fail
    const tamperedPayload = {
      ...canonicalPayload,
      capacity: '5000 kg' // Maliciously forged capacity!
    };
    const isTamperedValid = CryptoService.verifySignature(tamperedPayload, signature);
    expect(isTamperedValid).toBe(false);
  });

  test('Append-Only Ledger: Should detect broken hash chaining if payload is modified', () => {
    const seq1 = 1;
    const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const eventType = 'GENESIS';
    const entityType = 'SYSTEM';
    const entityId = 'DOCA-ROOT';
    const payload = JSON.stringify({ version: '1.0' });
    const timestamp = new Date('2026-01-01T00:00:00Z');

    const hash1 = LedgerService.computeRecordHash(seq1, prevHash, eventType, entityType, entityId, payload, timestamp);
    expect(hash1).toHaveLength(64);

    // Block 2 chains to Block 1
    const seq2 = 2;
    const payload2 = JSON.stringify({ action: 'REGISTER' });
    const timestamp2 = new Date('2026-01-02T00:00:00Z');
    const hash2 = LedgerService.computeRecordHash(seq2, hash1, 'REGISTER', 'USER', 'USER-1', payload2, timestamp2);

    // If an adversary alters Block 1's payload
    const maliciousPayload = JSON.stringify({ version: 'FORGED_9.9' });
    const recomputedBlock1Hash = LedgerService.computeRecordHash(seq1, prevHash, eventType, entityType, entityId, maliciousPayload, timestamp);

    // Recomputed hash must not match the chained previousHash recorded in Block 2!
    expect(recomputedBlock1Hash).not.toEqual(hash1);
  });

  test('Predictive Wear Engine: Should flag high wear for heavy industrial instruments nearing expiry', () => {
    const heavyInstrument = PredictiveService.calculateWearRisk({
      category: 'WEIGHBRIDGE',
      accuracyClass: 'CLASS_III',
      usageIntensity: 'INDUSTRIAL_HEAVY',
      validityExpiryAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days left
      lastObservedError: 0.18,
      maxPermissibleError: 0.20
    });

    expect(heavyInstrument.wearRiskScore).toBeGreaterThanOrEqual(0.7);
    expect(heavyInstrument.wearCategory).toBe('CRITICAL');
    expect(heavyInstrument.earlyRenewalRecommended).toBe(true);

    const precisionJewelryBalance = PredictiveService.calculateWearRisk({
      category: 'NAWI_ELECTRONIC',
      accuracyClass: 'CLASS_I',
      usageIntensity: 'LOW',
      validityExpiryAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000), // 280 days left
      lastObservedError: 0.001,
      maxPermissibleError: 0.05
    });

    expect(precisionJewelryBalance.wearRiskScore).toBeLessThan(0.4);
    expect(precisionJewelryBalance.wearCategory).toBe('LOW');
  });
});
