import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import 'package:provider/provider.dart';
import '../data/models/assigned_job.dart';
import '../data/models/offline_inspection.dart';
import '../providers/inspection_provider.dart';

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
      debugPrint('GPS fetch failed, fallback coordinates used: $e');
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

  Future<void> _saveInspection() async {
    setState(() => _isSaving = true);
    final provider = context.read<InspectionProvider>();

    final inspection = OfflineInspection(
      id: const Uuid().v4(),
      applicationId: widget.job.id,
      instrumentSerial: widget.job.instrumentSerial,
      visualCheckPassed: _visualCheck,
      repeatabilityCheckPassed: _repeatabilityCheck,
      eccentricityErrorMm: double.tryParse(_eccentricityController.text) ?? 0.0,
      maxPermissibleErrorMpe: double.tryParse(_mpeController.text) ?? 0.20,
      observedError: double.tryParse(_observedErrorController.text) ?? 0.0,
      testWeightsUsed: _testWeightsController.text.trim(),
      securitySealNumber: _sealNumberController.text.trim(),
      result: _result,
      officerNotes: _officerNotesController.text.trim(),
      geoLatitude: _currentPosition?.latitude ?? 11.9416,
      geoLongitude: _currentPosition?.longitude ?? 79.8083,
      photoBase64: _capturedImage?.path,
      timestamp: DateTime.now().toIso8601String(),
    );

    await provider.saveInspection(inspection);

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _result == 'PASS'
                ? '✅ Inspection saved to local queue! Ready for tamper-evident ledger sync.'
                : '⚠️ Rejection observations recorded (Form VIII issued)!',
          ),
          backgroundColor: _result == 'PASS' ? const Color(0xFF047857) : const Color(0xFFBE123C),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Re-Inspect / Amend Findings' : 'Statutory Inspection Record'),
        backgroundColor: const Color(0xFF0F2B5C),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Target Instrument Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.job.instrumentSerial,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E3A8A)),
                  ),
                  Text('${widget.job.category} • ${widget.job.accuracyClass} (${widget.job.capacity})', style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('Premises: ${widget.job.premisesAddress}', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick Preset Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Text('⚡ Presets:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          ActionChip(
                            label: const Text('✓ Pass', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            backgroundColor: Colors.green[50],
                            side: BorderSide(color: Colors.green[300]!),
                            onPressed: () => _applyPreset('PASS'),
                          ),
                          const SizedBox(width: 6),
                          ActionChip(
                            label: const Text('⚠️ Marginal', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            backgroundColor: Colors.amber[50],
                            side: BorderSide(color: Colors.amber[300]!),
                            onPressed: () => _applyPreset('MARGINAL'),
                          ),
                          const SizedBox(width: 6),
                          ActionChip(
                            label: const Text('✕ Reject (Fail)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            backgroundColor: Colors.red[50],
                            side: BorderSide(color: Colors.red[300]!),
                            onPressed: () => _applyPreset('FAIL'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Physical Checks Switch Tiles
            Card(
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Visual & Marking Integrity', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Housing intact, verification markings visible', style: TextStyle(fontSize: 11)),
                    value: _visualCheck,
                    onChanged: (val) => setState(() => _visualCheck = val),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Repeatability & Zero Return', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Zero load return nominal across 3 repeat trials', style: TextStyle(fontSize: 11)),
                    value: _repeatabilityCheck,
                    onChanged: (val) => setState(() => _repeatabilityCheck = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Measured Errors Row
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _mpeController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'MPE (±g)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _observedErrorController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Observed (g)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _eccentricityController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Eccentricity'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Test Weights Used
            TextField(
              controller: _testWeightsController,
              decoration: const InputDecoration(labelText: 'Working Standards / Reference Weights Used'),
            ),
            const SizedBox(height: 16),

            // Security Seal Number & Result
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextField(
                    controller: _sealNumberController,
                    decoration: const InputDecoration(labelText: 'Official Seal #'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: DropdownButtonFormField<String>(
                    initialValue: _result,
                    decoration: const InputDecoration(labelText: 'Decision'),
                    items: const [
                      DropdownMenuItem(value: 'PASS', child: Text('PASS')),
                      DropdownMenuItem(value: 'FAIL', child: Text('REJECT')),
                    ],
                    onChanged: (val) => setState(() => _result = val!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Geolocation & Photo Preview
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.my_location, size: 16),
                    label: Text(
                      _currentPosition != null
                          ? '${_currentPosition!.latitude.toStringAsFixed(4)}° N'
                          : 'Fetch GPS',
                      style: const TextStyle(fontSize: 11),
                    ),
                    onPressed: _fetchGpsLocation,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.camera_alt, size: 16),
                    label: Text(
                      _capturedImage != null ? 'Photo Captured' : 'Take Photo',
                      style: const TextStyle(fontSize: 11),
                    ),
                    onPressed: _capturePhoto,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Officer Statutory Notes
            TextField(
              controller: _officerNotesController,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Officer Statutory Notes / Reason'),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _result == 'PASS' ? const Color(0xFF047857) : const Color(0xFFBE123C),
                ),
                icon: _isSaving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.save),
                label: Text(
                  _isSaving
                      ? 'Recording...'
                      : widget.isEditing
                          ? 'Save & Update Observations'
                          : 'Record Statutory Observation',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                onPressed: _isSaving ? null : _saveInspection,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
