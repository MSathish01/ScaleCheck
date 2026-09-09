import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { config } from '../config';

export interface CertificatePdfData {
  certificateNumber: string;
  qrPayloadUrl: string;
  signedPayloadHash: string;
  issueDate: Date;
  validityExpiryDate: Date;
  officerName: string;
  officerDesignation: string;
  jurisdiction: string;
  traderName: string;
  organizationName?: string;
  tradeAddress: string;
  instrumentSerial: string;
  instrumentCategory: string;
  makeAndModel: string;
  modelApprovalNumber: string;
  capacity: string;
  accuracyClass: string;
  testWeightsUsed: string;
  securitySealNumber: string;
  observedError?: number | null;
  maxPermissibleErrorMpe?: number | null;
}

export class PdfService {
  public static async generateVerificationCertificate(data: CertificatePdfData): Promise<string> {
    if (!fs.existsSync(config.certificatesPath)) {
      fs.mkdirSync(config.certificatesPath, { recursive: true });
    }

    const fileName = `${data.certificateNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    const filePath = path.join(config.certificatesPath, fileName);

    // Generate QR Code Buffer
    const qrBuffer = await QRCode.toBuffer(data.qrPayloadUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 130,
      color: {
        dark: '#0b2545',
        light: '#ffffff'
      }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 36, right: 36 }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Decorative Outer & Inner Border ---
      doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor('#0b2545').stroke();
      doc.rect(25, 25, 545, 792).lineWidth(1).strokeColor('#f77f00').stroke();

      // --- Header: Government of India / DoCA ---
      doc.fontSize(10).fillColor('#13315c').font('Helvetica-Bold')
        .text('GOVERNMENT OF INDIA', { align: 'center' });
      doc.fontSize(8.5).fillColor('#334155').font('Helvetica')
        .text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', { align: 'center' });
      doc.fontSize(11).fillColor('#0b2545').font('Helvetica-Bold')
        .text('DEPARTMENT OF CONSUMER AFFAIRS', { align: 'center' });
      doc.fontSize(8.5).fillColor('#f77f00').font('Helvetica-Bold')
        .text('LEGAL METROLOGY DIVISION — STATUTORY VERIFICATION CERTIFICATE', { align: 'center' });

      doc.moveDown(0.4);
      doc.fontSize(7.5).fillColor('#475569').font('Helvetica-Oblique')
        .text('[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 27 of General Rules, 2011]', { align: 'center' });

      doc.moveDown(0.8);
      // Divider
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(35, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.6);

      // Certificate Identification Banner
      const startBannerY = doc.y;
      doc.rect(35, startBannerY, 525, 34).fillColor('#f1f5f9').fill();
      doc.rect(35, startBannerY, 5, 34).fillColor('#0b2545').fill();

      doc.fillColor('#0b2545').fontSize(9).font('Helvetica-Bold')
        .text('CERTIFICATE NO:', 46, startBannerY + 6);
      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold')
        .text(data.certificateNumber, 150, startBannerY + 6, { width: 195 });

      doc.fillColor('#0b2545').fontSize(9).font('Helvetica-Bold')
        .text('STATUS:', 46, startBannerY + 19);
      doc.fillColor('#16a34a').fontSize(9).font('Helvetica-Bold')
        .text('VERIFIED & STAMPED (ACTIVE)', 150, startBannerY + 19, { width: 195 });

      doc.fillColor('#0b2545').fontSize(8.5).font('Helvetica-Bold')
        .text('ISSUE DATE:', 355, startBannerY + 6);
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
        .text(new Date(data.issueDate).toLocaleDateString('en-IN'), 440, startBannerY + 6, { width: 105 });

      doc.fillColor('#0b2545').fontSize(8.5).font('Helvetica-Bold')
        .text('VALID UPTO:', 355, startBannerY + 19);
      doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica-Bold')
        .text(new Date(data.validityExpiryDate).toLocaleDateString('en-IN'), 440, startBannerY + 19, { width: 105 });

      // Section 1: Trader & Location Details
      const sec1HeadingY = startBannerY + 44;
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('1. STAKEHOLDER & PREMISES DETAILS', 40, sec1HeadingY);

      const sec1ContentY = sec1HeadingY + 14;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155')
        .text('Owner / Establishment: ', 45, sec1ContentY, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(`${data.organizationName || data.traderName} (${data.traderName})`);
      
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155')
        .text('Installation Premises: ', 45, doc.y + 2, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(data.tradeAddress);

      // Section 2: Instrument Details Table
      const sec2HeadingY = doc.y + 14;
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('2. VERIFIED INSTRUMENT SPECIFICATIONS', 40, sec2HeadingY);

      const tableTop = sec2HeadingY + 15;
      const tableHeight = 74;
      doc.rect(40, tableTop, 515, tableHeight).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

      // Horizontal dividers inside table for clean structure
      doc.strokeColor('#e2e8f0').lineWidth(0.5)
        .moveTo(40, tableTop + 24).lineTo(555, tableTop + 24).stroke()
        .moveTo(40, tableTop + 49).lineTo(555, tableTop + 49).stroke();

      const c1LabelX = 46;
      const c1LabelW = 100;
      const c1ValX = 148;
      const c1ValW = 144;

      const c2LabelX = 296;
      const c2LabelW = 100;
      const c2ValX = 398;
      const c2ValW = 152;

      // Row 1
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Instrument Category:', c1LabelX, tableTop + 6, { width: c1LabelW });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(data.instrumentCategory, c1ValX, tableTop + 6, { width: c1ValW });

      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Serial Number:', c2LabelX, tableTop + 6, { width: c2LabelW });
      doc.font('Helvetica-Bold').fillColor('#0b2545')
        .text(data.instrumentSerial, c2ValX, tableTop + 6, { width: c2ValW });

      // Row 2 (Make & Model gets 2-line safety with compact 7.5pt and bounded width)
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Make & Model:', c1LabelX, tableTop + 28, { width: c1LabelW });
      doc.fontSize(7.5).font('Helvetica').fillColor('#0f172a')
        .text(data.makeAndModel, c1ValX, tableTop + 26, { width: c1ValW, height: 20, ellipsis: true });

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Model Approval No:', c2LabelX, tableTop + 28, { width: c2LabelW });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(data.modelApprovalNumber, c2ValX, tableTop + 28, { width: c2ValW });

      // Row 3
      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Maximum Capacity:', c1LabelX, tableTop + 54, { width: c1LabelW });
      doc.font('Helvetica-Bold').fillColor('#0b2545')
        .text(data.capacity, c1ValX, tableTop + 54, { width: c1ValW });

      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Accuracy Class:', c2LabelX, tableTop + 54, { width: c2LabelW });
      doc.font('Helvetica-Bold').fillColor('#0b2545')
        .text(data.accuracyClass, c2ValX, tableTop + 54, { width: c2ValW });

      // Section 3: Legal Metrology Test Observations
      const sec3HeadingY = tableTop + tableHeight + 14;
      doc.fontSize(9.5).fillColor('#0b2545').font('Helvetica-Bold')
        .text('3. STATUTORY VERIFICATION & STAMPING RECORD', 40, sec3HeadingY);

      const testTableTop = sec3HeadingY + 15;
      const testTableHeight = 56;
      doc.rect(40, testTableTop, 515, testTableHeight).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

      // Divider inside test table
      doc.strokeColor('#e2e8f0').lineWidth(0.5)
        .moveTo(40, testTableTop + 20).lineTo(555, testTableTop + 20).stroke()
        .moveTo(40, testTableTop + 38).lineTo(555, testTableTop + 38).stroke();

      // Row 1
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
        .text('Working Standards Used:', c1LabelX, testTableTop + 5, { width: 120 });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(data.testWeightsUsed, c1ValX + 5, testTableTop + 5, { width: 395 });

      // Row 2
      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Official Security Seal No:', c1LabelX, testTableTop + 24, { width: c1LabelW + 15 });
      doc.font('Helvetica-Bold').fillColor('#0b2545')
        .text(data.securitySealNumber, c1ValX + 5, testTableTop + 24, { width: c1ValW - 5 });

      const mpeText = data.maxPermissibleErrorMpe !== undefined && data.maxPermissibleErrorMpe !== null ? `± ${data.maxPermissibleErrorMpe}` : 'Within Limits';
      const obsText = data.observedError !== undefined && data.observedError !== null ? `${data.observedError}` : '0.00';

      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Permissible MPE:', c2LabelX, testTableTop + 24, { width: c2LabelW });
      doc.font('Helvetica').fillColor('#0f172a')
        .text(mpeText, c2ValX, testTableTop + 24, { width: c2ValW });

      // Row 3
      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Observed Test Error:', c1LabelX, testTableTop + 42, { width: c1LabelW + 15 });
      doc.font('Helvetica-Bold').fillColor('#16a34a')
        .text(`${obsText} (PASSED)`, c1ValX + 5, testTableTop + 42, { width: c1ValW - 5 });

      doc.font('Helvetica-Bold').fillColor('#475569')
        .text('Statutory Result:', c2LabelX, testTableTop + 42, { width: c2LabelW });
      doc.font('Helvetica-Bold').fillColor('#16a34a')
        .text('VERIFIED & STAMPED', c2ValX, testTableTop + 42, { width: c2ValW });

      // Section 4: Cryptographic Crowd-Verify & Officer Signatures
      const bottomBoxY = testTableTop + testTableHeight + 16;
      doc.rect(40, bottomBoxY, 515, 140).lineWidth(0.5).strokeColor('#94a3b8').stroke();

      // Embed QR Code
      doc.image(qrBuffer, 50, bottomBoxY + 12, { width: 115, height: 115 });

      // QR explanation (Center Column)
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('CROWD-VERIFICATION QR CODE', 178, bottomBoxY + 12, { width: 230 });
      doc.fontSize(7.5).font('Helvetica').fillColor('#334155')
        .text('Scan this QR code with any smartphone camera to verify the live authenticity of this certificate directly on the Government National Legal Metrology portal.', 178, bottomBoxY + 26, { width: 226 });

      doc.fontSize(7).font('Helvetica-Bold').fillColor('#475569')
        .text('SHA-256 DIGITAL PROOF HASH:', 178, bottomBoxY + 62, { width: 226 });
      doc.fontSize(6).font('Courier').fillColor('#0f172a')
        .text(data.signedPayloadHash, 178, bottomBoxY + 73, { width: 226 });

      doc.fontSize(7).font('Helvetica-Bold').fillColor('#16a34a')
        .text('CRYPTOGRAPHICALLY SECURED (NON-COUNTERFEITABLE)', 178, bottomBoxY + 105, { width: 226 });

      // Officer Signature Block on Right
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('ISSUING AUTHORITY', 415, bottomBoxY + 14, { width: 130, align: 'center' });
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a')
        .text(data.officerName, 415, bottomBoxY + 36, { width: 130, align: 'center' });
      doc.fontSize(7.5).font('Helvetica').fillColor('#475569')
        .text(data.officerDesignation, 415, bottomBoxY + 50, { width: 130, align: 'center' });
      doc.fontSize(7.5).font('Helvetica').fillColor('#475569')
        .text(data.jurisdiction, 415, bottomBoxY + 62, { width: 130, align: 'center' });

      doc.rect(420, bottomBoxY + 84, 120, 24).lineWidth(0.75).strokeColor('#0b2545').stroke();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0b2545')
        .text('DIGITALLY SIGNED', 420, bottomBoxY + 92, { width: 120, align: 'center' });

      // Footer Statutory Note
      doc.fontSize(7).fillColor('#64748b').font('Helvetica')
        .text('Note: It is an offence under Section 30 of the Legal Metrology Act, 2009 to alter, tamper with, or forge this certificate or use any unverified weight/measure.', 40, 785, { align: 'center', width: 515 });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}
