import { PdfService } from '../src/services/PdfService';
import { CryptoService } from '../src/services/CryptoService';

async function generateTestPdf() {
  CryptoService.initializeKeys();
  const certNumber = 'DOCA-PY-2026-00101';
  const qrUrl = `https://scale-check-theta.vercel.app/verify/${certNumber}`;
  const signedPayloadHash = 'ced72bfae44a0e9c51004d46e1ffde5db133d0d056cb5d3f7e98a6b8f28d97fc';

  const filePath = await PdfService.generateVerificationCertificate({
    certificateNumber: certNumber,
    qrPayloadUrl: qrUrl,
    signedPayloadHash: signedPayloadHash,
    issueDate: new Date('2026-02-10T11:30:00Z'),
    validityExpiryDate: new Date('2027-02-09T23:59:59Z'),
    officerName: 'Inspector M. Anbarasan',
    officerDesignation: 'Legal Metrology Officer (Inspector)',
    jurisdiction: 'Puducherry District, Puducherry',
    traderName: 'R. Vignesh Kumar',
    organizationName: 'Auroville Highway Auto Fuels',
    tradeAddress: 'NH-66, East Coast Road, Auroville Junction, Puducherry',
    instrumentSerial: 'FD-MIDCO-PY-55018',
    instrumentCategory: 'FUEL_DISPENSER',
    makeAndModel: 'Midco UltraFlow Multi-Product Fuel Dispenser Model MPD-4N',
    modelApprovalNumber: 'IND/09/2021/789',
    capacity: '50 L/min (Delivery Accuracy ±0.2%)',
    accuracyClass: 'CLASS_0.5',
    testWeightsUsed: 'Standard 5L & 20L Conical Prover Flasks (Class A Certified)',
    securitySealNumber: 'PY-DOCA-SL-99412',
    observedError: 0.05,
    maxPermissibleErrorMpe: 0.2
  });

  console.log('✅ Certificate PDF re-rendered perfectly at:', filePath);
}

generateTestPdf().catch(console.error);
