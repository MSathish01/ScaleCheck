import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CryptoService } from '../src/services/CryptoService';
import { LedgerService } from '../src/services/LedgerService';
import { PdfService } from '../src/services/PdfService';
import { config } from '../src/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ScaleCheck Legal Metrology Seeding...');

  // Initialize asymmetric crypto keys
  CryptoService.initializeKeys();

  // Clear existing database tables
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.application.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.stakeholderProfile.deleteMany();
  await prisma.verificationLedger.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing database wiped clean.');

  // Initialize Genesis block in ledger
  await LedgerService.ensureGenesisBlock();

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Admin@123', salt);
  const officerPasswordHash = await bcrypt.hash('Officer@123', salt);
  const traderPasswordHash = await bcrypt.hash('Trader@123', salt);
  const gatcPasswordHash = await bcrypt.hash('Gatc@123', salt);

  // 1. Create Central Admin (DoCA National HQ)
  const centralAdmin = await prisma.user.create({
    data: {
      email: 'doca.admin@nic.in',
      phone: '+91 11 2338 1234',
      passwordHash: commonPasswordHash,
      fullName: 'Dr. Rajesh Verma, IAS',
      role: 'CENTRAL_ADMIN',
      state: 'Delhi',
      district: 'New Delhi',
      profile: {
        create: {
          organizationName: 'Department of Consumer Affairs, Govt. of India',
          jurisdiction: 'National - All States & UTs',
          isVerified: true
        }
      }
    }
  });

  // 2. Create State Admin (Puducherry State Controller)
  const stateAdmin = await prisma.user.create({
    data: {
      email: 'py.admin@gov.in',
      phone: '+91 413 222 5566',
      passwordHash: commonPasswordHash,
      fullName: 'K. Senthil Nathan',
      role: 'STATE_ADMIN',
      state: 'Puducherry',
      district: 'Puducherry',
      profile: {
        create: {
          organizationName: 'Office of the Controller of Legal Metrology, Puducherry',
          jurisdiction: 'Puducherry UT',
          isVerified: true
        }
      }
    }
  });

  // 3. Create Legal Metrology Officer (LMO)
  const lmo = await prisma.user.create({
    data: {
      email: 'lmo.puducherry@gov.in',
      phone: '+91 94432 10987',
      passwordHash: officerPasswordHash,
      fullName: 'Inspector M. Anbarasan',
      role: 'LMO',
      state: 'Puducherry',
      district: 'Puducherry',
      profile: {
        create: {
          organizationName: 'Legal Metrology Inspection Zone 1, Puducherry',
          jurisdiction: 'Puducherry Central & Commercial Market Zone',
          isVerified: true
        }
      }
    }
  });

  // 4. Create Government Approved Test Centre (GATC)
  const gatc = await prisma.user.create({
    data: {
      email: 'gatc.south@testlab.org',
      phone: '+91 413 234 8899',
      passwordHash: gatcPasswordHash,
      fullName: 'National Metrology Calibration Laboratories Ltd',
      role: 'GATC',
      state: 'Puducherry',
      district: 'Puducherry',
      profile: {
        create: {
          organizationName: 'NMCL Approved Test Centre #PY-04',
          approvalNumber: 'GATC-DOCA-2024-009',
          accreditationExpiry: new Date('2028-12-31'),
          isVerified: true,
          address: 'Plot 45, PIPDIC Industrial Estate, Sedarapet, Puducherry'
        }
      }
    }
  });

  // 5. Create Traders
  const traderGrain = await prisma.user.create({
    data: {
      email: 'trader.mandi@chennai.com',
      phone: '+91 98401 23456',
      passwordHash: traderPasswordHash,
      fullName: 'S. Ramanathan',
      role: 'TRADER',
      state: 'Tamil Nadu',
      district: 'Chennai',
      profile: {
        create: {
          organizationName: 'Kaveri Wholesale Agro Mandi & Traders',
          tradeLicenseNo: 'TL-CHN-2023-8841',
          gstin: '33AABCK9921E1Z5',
          address: 'Shop 14, Koyambedu Wholesale Market Complex, Chennai',
          isVerified: true
        }
      }
    }
  });

  const traderFuel = await prisma.user.create({
    data: {
      email: 'trader.petrol@puducherry.in',
      phone: '+91 98940 77665',
      passwordHash: traderPasswordHash,
      fullName: 'R. Vignesh Kumar',
      role: 'TRADER',
      state: 'Puducherry',
      district: 'Puducherry',
      profile: {
        create: {
          organizationName: 'Auroville Highway Auto Fuels (IOCL Dealer)',
          tradeLicenseNo: 'TL-PY-2022-3341',
          gstin: '34AAACG1122D1Z9',
          address: 'NH-66, East Coast Road, Auroville Junction, Puducherry',
          isVerified: true
        }
      }
    }
  });

  const traderJewel = await prisma.user.create({
    data: {
      email: 'trader.jewels@bengaluru.in',
      phone: '+91 99001 54321',
      passwordHash: traderPasswordHash,
      fullName: 'Vikram Mehta',
      role: 'TRADER',
      state: 'Karnataka',
      district: 'Bengaluru',
      profile: {
        create: {
          organizationName: 'Sri Lakshmi Precision Diamond & Gold Jewellers',
          tradeLicenseNo: 'TL-BLR-2021-9982',
          gstin: '29AABCS8876L1Z4',
          address: '88, Commercial Street, Tasker Town, Bengaluru',
          isVerified: true
        }
      }
    }
  });

  console.log('👥 Stakeholder accounts created for all 5 roles.');

  // 6. Create Commercial Instruments
  // Instrument 1: Electronic Platform Scale (Verified with Certificate)
  const inst1 = await prisma.instrument.create({
    data: {
      ownerId: traderGrain.id,
      serialNumber: 'EPS-2024-TN-99241',
      category: 'NAWI_ELECTRONIC',
      makeAndModel: 'Essae-Teraoka DS-215 Electronic Platform Scale',
      modelApprovalNumber: 'IND/09/2019/341',
      capacity: '150 kg (e = 20 g)',
      accuracyClass: 'CLASS_III',
      installationAddress: 'Shop 14, Koyambedu Wholesale Market Complex, Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      usageIntensity: 'HIGH',
      status: 'VERIFIED',
      lastVerifiedAt: new Date('2026-01-15'),
      validityExpiryAt: new Date('2027-01-14'),
      wearRiskScore: 0.18,
      predictiveAdvisory: 'Freshly calibrated and stamped. Accuracy drift well within legal limits.',
      renewalIncentiveEligible: false
    }
  });

  // Instrument 2: Fuel Dispenser (Puducherry, Verified with Certificate)
  const inst2 = await prisma.instrument.create({
    data: {
      ownerId: traderFuel.id,
      serialNumber: 'FD-MIDCO-PY-55018',
      category: 'FUEL_DISPENSER',
      makeAndModel: 'Midco UltraFlow Multi-Product Fuel Dispenser Model MPD-4N',
      modelApprovalNumber: 'IND/09/2021/789',
      capacity: '50 L/min (Delivery Accuracy ±0.2%)',
      accuracyClass: 'CLASS_0.5',
      installationAddress: 'NH-66, East Coast Road, Auroville Junction, Puducherry',
      state: 'Puducherry',
      district: 'Puducherry',
      usageIntensity: 'HIGH',
      status: 'VERIFIED',
      lastVerifiedAt: new Date('2026-02-10'),
      validityExpiryAt: new Date('2027-02-09'),
      wearRiskScore: 0.22,
      predictiveAdvisory: 'Operating at high daily throughput. Flow meter chamber nominal.',
      renewalIncentiveEligible: false
    }
  });

  // Instrument 3: Electronic Carat Balance (High precision, Expiring soon for demo predictive wear)
  const inst3 = await prisma.instrument.create({
    data: {
      ownerId: traderJewel.id,
      serialNumber: 'PREC-SART-BLR-0042',
      category: 'NAWI_ELECTRONIC',
      makeAndModel: 'Sartorius Entris II Analytical Micro-Balance',
      modelApprovalNumber: 'IND/09/2020/112',
      capacity: '220 g (d = 0.1 mg)',
      accuracyClass: 'CLASS_I',
      installationAddress: '88, Commercial Street, Tasker Town, Bengaluru',
      state: 'Karnataka',
      district: 'Bengaluru',
      usageIntensity: 'LOW',
      status: 'VERIFIED',
      lastVerifiedAt: new Date('2025-09-20'),
      validityExpiryAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Expiring in 14 days!
      wearRiskScore: 0.68,
      predictiveAdvisory: 'Approaching statutory expiry (14 days left). Class I precision standards require timely recalibration.',
      renewalIncentiveEligible: true
    }
  });

  // Instrument 4: Heavy Weighbridge (Puducherry, Pending scheduled inspection for live demo!)
  const inst4 = await prisma.instrument.create({
    data: {
      ownerId: traderFuel.id,
      serialNumber: 'WB-AVERY-PY-10882',
      category: 'WEIGHBRIDGE',
      makeAndModel: 'Avery Weigh-Tronix Pitless Concrete Deck Weighbridge',
      modelApprovalNumber: 'IND/09/2018/550',
      capacity: '60 Metric Tonnes (e = 10 kg)',
      accuracyClass: 'CLASS_III',
      installationAddress: 'Logistics Bay 2, Sedarapet Heavy Freight Depot, Puducherry',
      state: 'Puducherry',
      district: 'Puducherry',
      usageIntensity: 'INDUSTRIAL_HEAVY',
      status: 'PENDING_INSPECTION',
      wearRiskScore: 0.45,
      predictiveAdvisory: 'High-tonnage vehicle traffic. Annual statutory reverification requested.',
      renewalIncentiveEligible: false
    }
  });

  console.log('⚖️ Commercial instruments seeded across categories.');

  // 7. Create Verification Applications & Completed Workflow
  // Workflow for Instrument 2 (Puducherry Fuel Dispenser - Completed Happy Path)
  const app2 = await prisma.application.create({
    data: {
      applicationNumber: 'APP-2026-00042',
      type: 'PERIODIC_REVERIFICATION',
      status: 'CERTIFIED',
      traderId: traderFuel.id,
      instrumentId: inst2.id,
      allocatedToId: lmo.id,
      targetType: 'LMO',
      feeAmount: 1200.0,
      feePaymentStatus: 'PAID',
      feeTransactionRef: 'TXN-DOCA-PY-88392',
      scheduledDate: new Date('2026-02-10T10:30:00Z'),
      remarks: 'Annual statutory verification of retail dispensing unit'
    }
  });

  const insp2 = await prisma.inspection.create({
    data: {
      applicationId: app2.id,
      instrumentId: inst2.id,
      inspectorId: lmo.id,
      inspectionDate: new Date('2026-02-10T11:00:00Z'),
      visualCheckPassed: true,
      repeatabilityCheckPassed: true,
      eccentricityErrorMm: 0.0,
      maxPermissibleErrorMpe: 0.2, // ±0.2%
      observedError: 0.05,
      testWeightsUsed: 'Standard 5L & 20L Conical Prover Flasks (Class A Certified)',
      securitySealNumber: 'PY-DOCA-SL-99412',
      geoLatitude: 12.0068,
      geoLongitude: 79.8105,
      result: 'PASS',
      officerNotes: 'Pulsar calibration tested. Physical lead seal #PY-DOCA-SL-99412 embossed on meter casing.'
    }
  });

  // Canonical payload and Cryptographic Signing for Certificate 2
  const certNumber2 = 'DOCA-PY-2026-00101';
  const canonicalPayload2 = {
    certificateNumber: certNumber2,
    instrumentSerial: inst2.serialNumber,
    instrumentCategory: inst2.category,
    capacity: inst2.capacity,
    accuracyClass: inst2.accuracyClass,
    issueDate: new Date('2026-02-10T11:30:00Z').toISOString(),
    validityExpiryDate: new Date('2027-02-09T23:59:59Z').toISOString(),
    issuingOfficerId: lmo.id,
    securitySealNumber: insp2.securitySealNumber,
    inspectionResult: insp2.result
  };

  const { signature: sig2, payloadHash: hash2 } = CryptoService.signPayload(canonicalPayload2);
  const qrUrl2 = `${config.frontendUrl}/verify/${certNumber2}`;

  // Generate PDF file
  const pdfPath2 = await PdfService.generateVerificationCertificate({
    certificateNumber: certNumber2,
    qrPayloadUrl: qrUrl2,
    signedPayloadHash: hash2,
    issueDate: new Date('2026-02-10T11:30:00Z'),
    validityExpiryDate: new Date('2027-02-09T23:59:59Z'),
    officerName: lmo.fullName,
    officerDesignation: 'Legal Metrology Officer (Inspector)',
    jurisdiction: 'Puducherry District, Puducherry',
    traderName: traderFuel.fullName,
    organizationName: 'Auroville Highway Auto Fuels',
    tradeAddress: inst2.installationAddress,
    instrumentSerial: inst2.serialNumber,
    instrumentCategory: inst2.category,
    makeAndModel: inst2.makeAndModel,
    modelApprovalNumber: inst2.modelApprovalNumber,
    capacity: inst2.capacity,
    accuracyClass: inst2.accuracyClass,
    testWeightsUsed: insp2.testWeightsUsed,
    securitySealNumber: insp2.securitySealNumber,
    observedError: insp2.observedError,
    maxPermissibleErrorMpe: insp2.maxPermissibleErrorMpe
  });

  await prisma.certificate.create({
    data: {
      certificateNumber: certNumber2,
      instrumentId: inst2.id,
      applicationId: app2.id,
      inspectionId: insp2.id,
      issuingOfficerId: lmo.id,
      issueDate: new Date('2026-02-10T11:30:00Z'),
      validityExpiryDate: new Date('2027-02-09T23:59:59Z'),
      verificationStatus: 'VALID',
      digitalSignature: sig2,
      publicKeyId: CryptoService.getKeyId(),
      signedPayloadHash: hash2,
      qrPayloadUrl: qrUrl2,
      pdfFilePath: pdfPath2,
      earlyRenewalDiscountApplied: false
    }
  });

  // Workflow for Instrument 4 (Weighbridge - Allocated to LMO for the live demonstration!)
  const app4 = await prisma.application.create({
    data: {
      applicationNumber: 'APP-2026-00088',
      type: 'INITIAL_VERIFICATION',
      status: 'ALLOCATED',
      traderId: traderFuel.id,
      instrumentId: inst4.id,
      allocatedToId: lmo.id,
      targetType: 'LMO',
      feeAmount: 2500.0,
      feePaymentStatus: 'PAID',
      feeTransactionRef: 'TXN-DOCA-PY-91024',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Scheduled in 2 days
      remarks: 'New weighbridge commissioning inspection requested'
    }
  });

  // Populate Append-Only Verification Ledger for the seeded events
  await LedgerService.appendEntry({
    eventType: 'APPLICATION_SUBMITTED',
    entityType: 'APPLICATION',
    entityId: app2.id,
    payload: {
      applicationNumber: app2.applicationNumber,
      instrumentSerial: inst2.serialNumber,
      trader: traderFuel.fullName,
      feePaid: app2.feeAmount
    },
    actorId: traderFuel.id
  });

  await LedgerService.appendEntry({
    eventType: 'JOB_ALLOCATED',
    entityType: 'APPLICATION',
    entityId: app2.id,
    payload: {
      applicationNumber: app2.applicationNumber,
      allocatedOfficer: lmo.fullName,
      officerRole: lmo.role
    },
    actorId: stateAdmin.id
  });

  await LedgerService.appendEntry({
    eventType: 'INSPECTION_COMPLETED',
    entityType: 'INSPECTION',
    entityId: insp2.id,
    payload: {
      inspectionId: insp2.id,
      applicationNumber: app2.applicationNumber,
      instrumentSerial: inst2.serialNumber,
      result: insp2.result,
      securitySealNumber: insp2.securitySealNumber,
      observedError: insp2.observedError
    },
    actorId: lmo.id
  });

  await LedgerService.appendEntry({
    eventType: 'CERTIFICATE_ISSUED',
    entityType: 'CERTIFICATE',
    entityId: certNumber2,
    payload: {
      certificateNumber: certNumber2,
      instrumentSerial: inst2.serialNumber,
      validUntil: '2027-02-09',
      signedHash: hash2
    },
    actorId: lmo.id
  });

  await LedgerService.appendEntry({
    eventType: 'APPLICATION_SUBMITTED',
    entityType: 'APPLICATION',
    entityId: app4.id,
    payload: {
      applicationNumber: app4.applicationNumber,
      instrumentSerial: inst4.serialNumber,
      trader: traderFuel.fullName,
      targetOfficer: lmo.fullName
    },
    actorId: traderFuel.id
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: traderFuel.id,
        type: 'CERTIFICATE_READY',
        title: `Certificate Issued: ${certNumber2}`,
        message: `Your fuel dispenser certificate is active and cryptographically signed. Scan the QR code to verify.`,
        channel: 'EMAIL_STUB'
      },
      {
        userId: lmo.id,
        type: 'INSPECTION_ASSIGNED',
        title: `Inspection Scheduled: ${app4.applicationNumber}`,
        message: `Weighbridge inspection for #${inst4.serialNumber} assigned at Sedarapet Freight Depot.`,
        channel: 'IN_APP'
      },
      {
        userId: traderJewel.id,
        type: 'RENEWAL_REMINDER',
        title: `Statutory Expiry Approaching: #${inst3.serialNumber}`,
        message: `Your analytical balance certificate expires in 14 days. Apply today to receive early-renewal priority.`,
        channel: 'SMS_STUB'
      }
    ]
  });

  console.log('📜 Initial verified certificates and hash-chained ledger generated.');
  console.log('\n================================================================');
  console.log('✅ SEEDING COMPLETE! PRE-POPULATED CREDENTIALS FOR DEMO:');
  console.log('----------------------------------------------------------------');
  console.log('1. Central Admin (DoCA):    doca.admin@nic.in       / Admin@123');
  console.log('2. State Admin (Puducherry):py.admin@gov.in         / Admin@123');
  console.log('3. LMO (Officer Puducherry):lmo.puducherry@gov.in   / Officer@123');
  console.log('4. GATC Test Centre:        gatc.south@testlab.org  / Gatc@123');
  console.log('5. Trader (Fuel Station):   trader.petrol@puducherry.in / Trader@123');
  console.log('6. Trader (Grain Mandi):    trader.mandi@chennai.com    / Trader@123');
  console.log('7. Trader (Jewellery):      trader.jewels@bengaluru.in  / Trader@123');
  console.log('----------------------------------------------------------------');
  console.log('Crowd-Verify Demo Certificate ID: DOCA-PY-2026-00101');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
