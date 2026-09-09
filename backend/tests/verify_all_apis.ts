import http from 'http';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function request(options: {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const postData = options.body ? JSON.stringify(options.body) : undefined;

    const req = http.request(
      url,
      {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const data = rawData ? JSON.parse(rawData) : {};
            resolve({ statusCode: res.statusCode || 500, data });
          } catch {
            resolve({ statusCode: res.statusCode || 500, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n🔍 =========================================================================');
  console.log('🏛️  ScaleCheck Backend API Verification — Full Statutory Endpoint Audit');
  console.log('🔍 =========================================================================\n');

  // 1. Health Check (Public)
  try {
    const res = await request({ path: '/health', method: 'GET' });
    const passed = res.statusCode === 200 && res.data.status === 'UP';
    results.push({
      endpoint: '/health',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: `Service: ${res.data.service} (Uptime: ${Math.round(res.data.uptime)}s)`,
    });
  } catch (err: any) {
    results.push({ endpoint: '/health', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 2. Public Trust Key Discovery (Public)
  try {
    const res = await request({ path: '/api/v1/analytics/public-key', method: 'GET' });
    const passed = res.statusCode === 200 && !!res.data.publicKeyPem;
    results.push({
      endpoint: '/api/v1/analytics/public-key',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `KeyId: ${res.data.keyId} (${res.data.algorithm})` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/analytics/public-key', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 3. Auth: Central Admin Login
  let adminToken = '';
  try {
    const res = await request({
      path: '/api/v1/auth/login',
      method: 'POST',
      body: { email: 'doca.admin@nic.in', password: 'Admin@123' },
    });
    const passed = res.statusCode === 200 && !!res.data.data?.token;
    if (passed) adminToken = res.data.data.token;
    results.push({
      endpoint: '/api/v1/auth/login (Central Admin)',
      method: 'POST',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `User: ${res.data.data.user.fullName} (${res.data.data.user.role})` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/auth/login (Central Admin)', method: 'POST', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 4. Auth: Legal Metrology Officer (LMO) Login
  let lmoToken = '';
  try {
    const res = await request({
      path: '/api/v1/auth/login',
      method: 'POST',
      body: { email: 'lmo.puducherry@gov.in', password: 'Officer@123' },
    });
    const passed = res.statusCode === 200 && !!res.data.data?.token;
    if (passed) lmoToken = res.data.data.token;
    results.push({
      endpoint: '/api/v1/auth/login (LMO Inspector)',
      method: 'POST',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `User: ${res.data.data.user.fullName} (${res.data.data.user.role})` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/auth/login (LMO Inspector)', method: 'POST', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 5. Auth: Agro Trader Login
  let traderToken = '';
  try {
    const res = await request({
      path: '/api/v1/auth/login',
      method: 'POST',
      body: { email: 'trader.mandi@chennai.com', password: 'Trader@123' },
    });
    const passed = res.statusCode === 200 && !!res.data.data?.token;
    if (passed) traderToken = res.data.data.token;
    results.push({
      endpoint: '/api/v1/auth/login (Agro Trader)',
      method: 'POST',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `User: ${res.data.data.user.fullName} (${res.data.data.user.role})` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/auth/login (Agro Trader)', method: 'POST', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 6. Instruments: List All (Admin/LMO)
  let testInstrumentId = '';
  try {
    const res = await request({
      path: '/api/v1/instruments/all',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    if (passed && res.data.data.length > 0) {
      testInstrumentId = res.data.data[0].id;
    }
    results.push({
      endpoint: '/api/v1/instruments/all (Admin)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Retrieved ${res.data.data.length} registered instruments` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/instruments/all', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 7. Instruments: My Instruments (Trader)
  try {
    const res = await request({
      path: '/api/v1/instruments/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${traderToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    results.push({
      endpoint: '/api/v1/instruments/my (Trader)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Trader has ${res.data.data.length} instruments registered` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/instruments/my', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 8. Instruments: Detail & Predictive Wear Scoring
  if (testInstrumentId) {
    try {
      const res = await request({
        path: `/api/v1/instruments/${testInstrumentId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const passed = res.statusCode === 200 && !!res.data.data?.serialNumber;
      results.push({
        endpoint: `/api/v1/instruments/:id (Wear Score Engine)`,
        method: 'GET',
        status: res.statusCode,
        expectedStatus: 200,
        passed,
        notes: passed
          ? `S/N: ${res.data.data.serialNumber} | Risk Score: ${res.data.data.wearRiskScore} | Advisory: ${res.data.data.predictiveAdvisory?.substring(0, 35)}...`
          : res.data.message,
      });
    } catch (err: any) {
      results.push({ endpoint: `/api/v1/instruments/:id`, method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
    }
  }

  // 9. Applications: All Applications Workflow (Admin)
  try {
    const res = await request({
      path: '/api/v1/applications/all',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    results.push({
      endpoint: '/api/v1/applications/all (Workflow)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Found ${res.data.data.length} statutory applications in workflow` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/applications/all', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 10. Applications: Allocated Jobs (LMO Field Queue)
  try {
    const res = await request({
      path: '/api/v1/applications/allocated',
      method: 'GET',
      headers: { Authorization: `Bearer ${lmoToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    results.push({
      endpoint: '/api/v1/applications/allocated (Field Queue)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Inspector has ${res.data.data.length} assigned inspections` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/applications/allocated', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 11. Public Crowd-Verify Certificate via QR / Certificate Number (Valid Certificate)
  const validCertNumber = 'DOCA-PY-2026-00101';
  try {
    const res = await request({
      path: `/api/v1/certificates/verify/${validCertNumber}`,
      method: 'GET',
    });
    const passed = res.statusCode === 200 && res.data.success === true && res.data.isAuthentic === true;
    results.push({
      endpoint: `/api/v1/certificates/verify/${validCertNumber}`,
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed
        ? `Status: ${res.data.status} | Signature: ${res.data.signatureIntegrity} ✅ | Instrument: ${res.data.data?.instrument?.serialNumber}`
        : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: `/api/v1/certificates/verify/:id`, method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 12. Public Crowd-Verify: Counterfeit / Tampered Certificate Detection
  const fakeCertNumber = 'FAKE-SEAL-TAMPERED-999';
  try {
    const res = await request({
      path: `/api/v1/certificates/verify/${fakeCertNumber}`,
      method: 'GET',
    });
    const passed = res.statusCode === 404 && res.data.success === false && res.data.isAuthentic === false;
    results.push({
      endpoint: `/api/v1/certificates/verify (Counterfeit Test)`,
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 404,
      passed,
      notes: passed ? `Fraud Flagged: "${res.data.message.substring(0, 48)}..."` : 'Fraud was not flagged',
    });
  } catch (err: any) {
    results.push({ endpoint: `/api/v1/certificates/verify (Fake)`, method: 'GET', status: 0, expectedStatus: 404, passed: false, notes: err.message });
  }

  // 13. Tamper-Evident Verification Ledger History
  try {
    const res = await request({
      path: '/api/v1/ledger',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    results.push({
      endpoint: '/api/v1/ledger (Audit History)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Ledger contains ${res.data.data.length} immutable SHA-256 blocks` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/ledger', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 14. Cryptographic Chain Validation (Sequential Hashing)
  try {
    const res = await request({
      path: '/api/v1/ledger/validate',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && res.data.data?.isValid === true;
    results.push({
      endpoint: '/api/v1/ledger/validate (Chain Validator)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed
        ? `Ledger Cryptographic Continuity: INTACT (${res.data.data.totalBlocks} blocks validated)`
        : `Breached: ${res.data.data?.errorMessage}`,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/ledger/validate', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 15. Admin Analytics & Surveillance Dashboard
  try {
    const res = await request({
      path: '/api/v1/analytics/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && res.data.success === true;
    results.push({
      endpoint: '/api/v1/analytics/dashboard (Admin KPI)',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed
        ? `National Compliance: ${res.data.data.nationalComplianceRate}% | Instruments: ${res.data.data.totalNationalInstruments} | Blocks: ${res.data.data.totalLedgerBlocks}`
        : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/analytics/dashboard', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // 16. User Notifications API
  try {
    const res = await request({
      path: '/api/v1/analytics/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const passed = res.statusCode === 200 && Array.isArray(res.data.data);
    results.push({
      endpoint: '/api/v1/analytics/notifications',
      method: 'GET',
      status: res.statusCode,
      expectedStatus: 200,
      passed,
      notes: passed ? `Inbox has ${res.data.data.length} statutory notices` : res.data.message,
    });
  } catch (err: any) {
    results.push({ endpoint: '/api/v1/analytics/notifications', method: 'GET', status: 0, expectedStatus: 200, passed: false, notes: err.message });
  }

  // Print Summary Table
  console.log('\n📊 STATUTORY BACKEND AUDIT RESULTS:');
  console.log('------------------------------------------------------------------------------------------------------------------------');
  console.log('Status  | Method | Endpoint                                       | Audit Findings');
  console.log('------------------------------------------------------------------------------------------------------------------------');
  let allPassed = true;
  for (const r of results) {
    const badge = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) allPassed = false;
    const ep = r.endpoint.padEnd(46, ' ');
    const meth = r.method.padEnd(6, ' ');
    console.log(`${badge} | ${meth} | ${ep} | ${r.notes}`);
  }
  console.log('------------------------------------------------------------------------------------------------------------------------\n');

  if (allPassed) {
    console.log('🌟 ALL 16 STATUTORY BACKEND APIS ARE 100% OPERATIONAL WITH ZERO FAILURES!\n');
  } else {
    console.log('⚠️ Some checks failed. Review issues above.\n');
  }
}

runTests();
