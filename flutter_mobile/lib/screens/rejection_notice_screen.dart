import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/models/assigned_job.dart';
import 'inspection_form_screen.dart';

class RejectionNoticeScreen extends StatelessWidget {
  final AssignedJob job;
  const RejectionNoticeScreen({super.key, required this.job});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Statutory Rejection Notice',
              style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            Text(
              'Form VIII • Legal Metrology Act, 2009',
              style: GoogleFonts.plusJakartaSans(fontSize: 11, color: const Color(0xFFFECDD3)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFFBE123C), // Crimson Red
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Official Form VIII Header Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFF1F2), Color(0xFFFFE4E6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFDA4AF)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFBE123C).withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE11D48),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.gavel, size: 20, color: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FORM VIII • SECTION 24 STATUTORY ORDER',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF9F1239),
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              'LEGAL METROLOGY ACT, 2009',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF881337),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFFFECDD3), height: 1),
                  const SizedBox(height: 10),
                  Text(
                    'NOTICE OF REJECTION & NON-CONFORMANCE OF MEASURING INSTRUMENT',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF4C0519),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Metadata Table Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _infoRow('Statutory Application #', job.applicationNumber),
                  const Divider(height: 18, color: Color(0xFFF1F5F9)),
                  _infoRow('Instrument Serial Number', job.instrumentSerial),
                  const Divider(height: 18, color: Color(0xFFF1F5F9)),
                  _infoRow('Category & Model', '${job.category} (${job.instrumentModel})'),
                  const Divider(height: 18, color: Color(0xFFF1F5F9)),
                  _infoRow('Commercial Trader', job.traderName),
                  const Divider(height: 18, color: Color(0xFFF1F5F9)),
                  _infoRow('Premises Address', job.premisesAddress),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Grounds for Rejection Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFDA4AF)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.report_problem, size: 16, color: Color(0xFFBE123C)),
                      const SizedBox(width: 6),
                      Text(
                        'Statutory Grounds for Rejection:',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFFBE123C),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    job.rejectionReason ?? 'Observed error exceeds maximum permissible statutory tolerance (MPE).',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1E293B),
                      height: 1.4,
                    ),
                  ),
                  if (job.securitySealNumber != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Physical Seal Tag Attached: ${job.securitySealNumber}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF334155),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Mandatory Directive Alert
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFCD34D)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFFB45309)),
                      const SizedBox(width: 6),
                      Text(
                        'Mandatory Legal Directive (7-Day Cure Period):',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF78350F),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Under Section 24 of the Legal Metrology Act 2009, this instrument is strictly barred from trade transactions. The owner is granted a 7-day cure window to have the scale serviced by an authorized manufacturer technician and apply for re-verification.',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: const Color(0xFF451A03),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Re-inspect button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F2B5C),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.edit_note, size: 18),
              label: Text(
                'Re-Inspect / Amend Observations',
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13),
              ),
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => InspectionFormScreen(job: job, isEditing: true)),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            color: const Color(0xFF64748B),
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 10),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }
}
