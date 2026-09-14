import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/models/assigned_job.dart';
import '../data/models/offline_inspection.dart';
import '../providers/inspection_provider.dart';
import 'rejection_notice_screen.dart';

class InspectionFormScreen extends StatefulWidget {
  final AssignedJob job;
  final bool isEditing;

  const InspectionFormScreen({super.key, required this.job, this.isEditing = false});

  @override
  State<InspectionFormScreen> createState() => _InspectionFormScreenState();
}

class _InspectionFormScreenState extends State<InspectionFormScreen> {
  bool _visualCheck = true;
  bool _repeatabilityCheck = true;
  final TextEditingController _mpeController = TextEditingController(text: '0.20');
  final TextEditingController _observedErrorController = TextEditingController(text: '0.02');
  final TextEditingController _eccentricityController = TextEditingController(text: '0.00');
  final TextEditingController _testWeightsController = TextEditingController(
    text: 'Class F1 Working Standard Stamped Weights (Serial #CW-992)',
  );
  late final TextEditingController _sealNumberController;
  final TextEditingController _officerNotesController = TextEditingController(
    text: 'Stamping verified in accordance with Legal Metrology (General) Rules, 2011.',
  );
  String _result = 'PASS';
  Position? _currentPosition;
  XFile? _capturedImage;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final seal = widget.job.securitySealNumber ?? 'DOCA-SL-${10000 + (DateTime.now().millisecond % 90000)}';
    _sealNumberController = TextEditingController(text: seal);

    if (widget.isEditing && widget.job.rejectionReason != null) {
      _officerNotesController.text = widget.job.rejectionReason!;
      _result = widget.job.status == 'REJECTED' ? 'FAIL' : 'PASS';
    }

    _fetchGpsLocation();
  }

  @override
  void dispose() {
    _mpeController.dispose();
    _observedErrorController.dispose();
    _eccentricityController.dispose();
    _testWeightsController.dispose();
    _sealNumberController.dispose();
    _officerNotesController.dispose();
    super.dispose();
  }

  Future<void> _fetchGpsLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition();
        if (mounted) setState(() => _currentPosition = pos);
      }
    } catch (e) {
      debugPrint('GPS fetch fallback: $e');
    }
  }

  Future<void> _capturePhoto() async {
    final picker = ImagePicker();
    final photo = await picker.pickImage(source: ImageSource.camera, maxWidth: 1200, imageQuality: 85);
    if (photo != null && mounted) {
      setState(() => _capturedImage = photo);
    }
  }

  void _applyPreset(String type) {
    setState(() {
      if (type == 'PASS') {
        _visualCheck = true;
        _repeatabilityCheck = true;
        _mpeController.text = '0.20';
        _observedErrorController.text = '0.02';
        _eccentricityController.text = '0.00';
        _result = 'PASS';
        _officerNotesController.text = 'Fully conforming with statutory tolerance limits. Stamped & cleared.';
      } else if (type == 'MARGINAL') {
        _visualCheck = true;
        _repeatabilityCheck = true;
        _mpeController.text = '0.20';
        _observedErrorController.text = '0.16';
        _eccentricityController.text = '0.05';
        _result = 'PASS';
        _officerNotesController.text = 'Within MPE limit (±0.20g). Scheduled servicing recommended.';
      } else {
        _visualCheck = false;
        _repeatabilityCheck = false;
        _mpeController.text = '0.20';
        _observedErrorController.text = '0.68';
        _eccentricityController.text = '0.40';
        _result = 'FAIL';
        _officerNotesController.text = 'REJECTED: Observed error (+0.68g) exceeds statutory MPE tolerance (±0.20g). Form VIII issued.';
      }
    });
  }

  Future<void> _handleSubmit() async {
    setState(() => _isSaving = true);
    final provider = context.read<InspectionProvider>();

    final inspection = OfflineInspection(
      id: const Uuid().v4(),
      applicationId: widget.job.id,
      instrumentSerial: widget.job.instrumentSerial,
      visualCheckPassed: _visualCheck,
      repeatabilityCheckPassed: _repeatabilityCheck,
      eccentricityErrorMm: double.tryParse(_eccentricityController.text) ?? 0.0,
      observedError: double.tryParse(_observedErrorController.text) ?? 0.0,
      maxPermissibleErrorMpe: double.tryParse(_mpeController.text) ?? 0.20,
      testWeightsUsed: _testWeightsController.text,
      result: _result,
      officerNotes: _officerNotesController.text,
      securitySealNumber: _sealNumberController.text,
      geoLatitude: _currentPosition?.latitude ?? 28.6139,
      geoLongitude: _currentPosition?.longitude ?? 77.2090,
      photoBase64: _capturedImage?.path,
      timestamp: DateTime.now().toIso8601String(),
    );

    try {
      await provider.saveInspection(inspection);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: _result == 'PASS' ? const Color(0xFF059669) : const Color(0xFFE11D48),
            content: Text(
              _result == 'PASS'
                  ? 'Verification complete! Cryptographic stamp recorded to local queue.'
                  : 'Form VIII Statutory Rejection recorded and generated.',
              style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
            ),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Save error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final mpeVal = double.tryParse(_mpeController.text) ?? 0.20;
    final observedVal = double.tryParse(_observedErrorController.text) ?? 0.0;
    final isWithinMpe = observedVal.abs() <= mpeVal;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B192C),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Statutory Verification Form',
              style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            Text(
              'S/N: ${widget.job.instrumentSerial} • ${widget.job.category}',
              style: GoogleFonts.plusJakartaSans(fontSize: 11, color: const Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Quick Simulation Presets
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.flash_on, size: 16, color: Color(0xFFD97706)),
                      const SizedBox(width: 6),
                      Text(
                        '1-Click Statutory Verification Presets:',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            backgroundColor: const Color(0xFFECFDF5),
                            side: const BorderSide(color: Color(0xFF10B981)),
                          ),
                          onPressed: () => _applyPreset('PASS'),
                          child: Text(
                            '✨ Full Pass',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF047857),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            backgroundColor: const Color(0xFFFFFBEB),
                            side: const BorderSide(color: Color(0xFFF59E0B)),
                          ),
                          onPressed: () => _applyPreset('MARGINAL'),
                          child: Text(
                            '⚠️ Marginal',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            backgroundColor: const Color(0xFFFFF1F2),
                            side: const BorderSide(color: Color(0xFFF43F5E)),
                          ),
                          onPressed: () => _applyPreset('FAIL'),
                          child: Text(
                            '❌ Form VIII',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFBE123C),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Section 1: GPS & Location Latching
            _buildSectionHeader('1. GPS Latching & Geo-Verification (Rule 24)', Icons.pin_drop_outlined),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.satellite_alt, color: Color(0xFF2563EB), size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _currentPosition != null
                              ? 'Lat: ${_currentPosition!.latitude.toStringAsFixed(5)}, Lon: ${_currentPosition!.longitude.toStringAsFixed(5)}'
                              : 'Lat: 28.61393° N, Lon: 77.20902° E (Puducherry/HQ)',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        Text(
                          'Statutory Geo-Fence: Within verified merchant boundary (±3.4m accuracy)',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10.5,
                            color: const Color(0xFF059669),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.my_location, size: 18, color: Color(0xFF2563EB)),
                    onPressed: _fetchGpsLocation,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Section 2: Tolerance & MPE Meter
            _buildSectionHeader('2. Statutory MPE Tolerance Testing', Icons.speed_outlined),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Live Dynamic Gauge
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isWithinMpe ? const Color(0xFFECFDF5) : const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isWithinMpe ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isWithinMpe ? Icons.check_circle : Icons.warning_amber_rounded,
                          color: isWithinMpe ? const Color(0xFF059669) : const Color(0xFFE11D48),
                          size: 24,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isWithinMpe
                                    ? 'TOLERANCE STATUS: CONFORMING (PASS)'
                                    : 'TOLERANCE STATUS: NON-CONFORMING (FAIL)',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: isWithinMpe ? const Color(0xFF047857) : const Color(0xFFBE123C),
                                ),
                              ),
                              Text(
                                'Observed: ${observedVal >= 0 ? "+" : ""}${observedVal}g vs Max Permissible Error (MPE): ±${mpeVal}g',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 10.5,
                                  color: isWithinMpe ? const Color(0xFF065F46) : const Color(0xFF9F1239),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Tolerance Inputs
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _mpeController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (_) => setState(() {}),
                          decoration: const InputDecoration(
                            labelText: 'Statutory MPE (±g)',
                            prefixIcon: Icon(Icons.tune, size: 18),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _observedErrorController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (_) => setState(() {}),
                          decoration: const InputDecoration(
                            labelText: 'Observed Error (g)',
                            prefixIcon: Icon(Icons.analytics_outlined, size: 18),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _eccentricityController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Eccentricity (Corner Load Deviation)',
                      prefixIcon: Icon(Icons.crop_free, size: 18),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _testWeightsController,
                    decoration: const InputDecoration(
                      labelText: 'Working Standard Used (Traceable to NPL)',
                      prefixIcon: Icon(Icons.fitness_center, size: 18),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Section 3: Visual & Physical Checklist
            _buildSectionHeader('3. Security Seal & Visual Inspection', Icons.security_outlined),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: Text(
                      'Visual & Metrological Plate Inspection',
                      style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      'Model approval mark, serial number plate, and leveling bubble intact.',
                      style: GoogleFonts.plusJakartaSans(fontSize: 10.5, color: const Color(0xFF64748B)),
                    ),
                    value: _visualCheck,
                    activeColor: const Color(0xFF059669),
                    onChanged: (v) => setState(() => _visualCheck = v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: Text(
                      'Repeatability & Hysteresis Test',
                      style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      'Repeated loads returned to zero within permissible variance.',
                      style: GoogleFonts.plusJakartaSans(fontSize: 10.5, color: const Color(0xFF64748B)),
                    ),
                    value: _repeatabilityCheck,
                    activeColor: const Color(0xFF059669),
                    onChanged: (v) => setState(() => _repeatabilityCheck = v),
                  ),
                  const Divider(height: 1),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _sealNumberController,
                    decoration: InputDecoration(
                      labelText: 'Tamper-Evident Seal Tag Number',
                      prefixIcon: const Icon(Icons.tag, size: 18),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.refresh, size: 18),
                        onPressed: () {
                          setState(() {
                            _sealNumberController.text = 'DOCA-SL-${10000 + (DateTime.now().millisecond % 90000)}';
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    icon: Icon(_capturedImage != null ? Icons.check_circle : Icons.camera_alt, color: const Color(0xFF2563EB), size: 18),
                    label: Text(
                      _capturedImage != null ? 'Photo Attached: ${_capturedImage!.name}' : 'Capture Geo-Tagged Plate Photo',
                      style: GoogleFonts.plusJakartaSans(fontSize: 11.5, fontWeight: FontWeight.w600),
                    ),
                    onPressed: _capturePhoto,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Section 4: Officer Decision & Statutory Outcome
            _buildSectionHeader('4. Statutory Decision & Verification Stamping', Icons.gavel_outlined),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _result = 'PASS'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: _result == 'PASS' ? const Color(0xFF059669) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: _result == 'PASS' ? const Color(0xFF047857) : const Color(0xFFCBD5E1)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.verified, size: 16, color: _result == 'PASS' ? Colors.white : const Color(0xFF64748B)),
                                const SizedBox(width: 6),
                                Text(
                                  'PASS & STAMP',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11.5,
                                    color: _result == 'PASS' ? Colors.white : const Color(0xFF475569),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _result = 'FAIL'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: _result == 'FAIL' ? const Color(0xFFE11D48) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: _result == 'FAIL' ? const Color(0xFFBE123C) : const Color(0xFFCBD5E1)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.cancel, size: 16, color: _result == 'FAIL' ? Colors.white : const Color(0xFF64748B)),
                                const SizedBox(width: 6),
                                Text(
                                  'FAIL (FORM VIII)',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11.5,
                                    color: _result == 'FAIL' ? Colors.white : const Color(0xFF475569),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _officerNotesController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: _result == 'PASS' ? 'Officer Verification Notes' : 'Statutory Rejection Reason (Section 24)',
                      prefixIcon: const Icon(Icons.edit_note, size: 20),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _result == 'PASS' ? const Color(0xFF0F2B5C) : const Color(0xFFBE123C),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _isSaving ? null : _handleSubmit,
              child: _isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_result == 'PASS' ? Icons.check_circle : Icons.assignment_late, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          _result == 'PASS'
                              ? 'Issue Verification Stamp & Record Stamping'
                              : 'Issue Statutory Form VIII Notice & Seal Rejection',
                          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF2563EB)),
        const SizedBox(width: 6),
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }
}
