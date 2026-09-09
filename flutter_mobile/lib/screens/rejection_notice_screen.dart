import 'package:flutter/material.dart';
import '../data/models/assigned_job.dart';
import 'inspection_form_screen.dart';

class RejectionNoticeScreen extends StatelessWidget {
  final AssignedJob job;
  const RejectionNoticeScreen({super.key, required this.job});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Statutory Rejection Notice'),
        backgroundColor: const Color(0xFFBE123C), // Crimson Red
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gov Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, size: 28, color: Colors.red[800]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FORM VIII • SECTION 24',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red[900]),
                            ),
                            const Text(
                              'LEGAL METROLOGY ACT, 2009',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Color(0xFF881337)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  const Text(
                    'NOTICE OF REJECTION & NON-CONFORMANCE OF MEASURING INSTRUMENT',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF4C0519)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Metadata Grid
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _infoRow('Application ID', job.applicationNumber),
                    const Divider(height: 16),
                    _infoRow('Instrument Serial', job.instrumentSerial),
                    const Divider(height: 16),
                    _infoRow('Make & Model', job.instrumentModel),
                    const Divider(height: 16),
                    _infoRow('Commercial Trader', job.traderName),
                    const Divider(height: 16),
                    _infoRow('Premises', job.premisesAddress),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Grounds for Rejection
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Statutory Grounds for Rejection:',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFBE123C)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    job.rejectionReason ?? 'Observed test error exceeded maximum permissible error limits (MPE).',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 12),
                  if (job.securitySealNumber != null)
                    Text('Physical Seal: ${job.securitySealNumber}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Legal Directive Notice
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('⚖️ Mandatory Legal Directive:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF78350F))),
                  SizedBox(height: 4),
                  Text(
                    'Under Section 24 of the Legal Metrology Act, 2009, this instrument is strictly barred from trade transactions. The user is granted a 7-day cure window to have this scale repaired by a licensed technician and request re-verification.',
                    style: TextStyle(fontSize: 11, color: Color(0xFF451A03)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB45309)),
                icon: const Icon(Icons.edit),
                label: const Text('Re-Inspect / Amend Observations'),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => InspectionFormScreen(job: job, isEditing: true)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
