import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/api_service.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final ApiService _api = ApiService();
  bool _isProcessing = false;
  Map<String, dynamic>? _verificationResult;

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode == null || barcode.rawValue == null) return;

    final rawVal = barcode.rawValue!;
    setState(() => _isProcessing = true);

    // Extract cert number (e.g. DOCA-PY-2026-00101)
    String certNo = rawVal;
    if (rawVal.contains('/verify/')) {
      certNo = rawVal.split('/verify/').last;
    }

    try {
      final res = await _api.verifyCertificate(certNo);
      if (mounted) {
        setState(() {
          _verificationResult = res['data'];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification check failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Official QR Seal'),
        backgroundColor: const Color(0xFF0F2B5C),
      ),
      body: Stack(
        children: [
          MobileScanner(
            onDetect: _onDetect,
          ),

          // Scan Overlay Window
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.greenAccent, width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),

          // Instruction Text
          Positioned(
            top: 24,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.black.withOpacity(0.7), borderRadius: BorderRadius.circular(12)),
              child: const Text(
                'Align the camera with the QR Seal on the scale plate or petrol dispenser.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),

          // Verification Sheet Modal (if detected)
          if (_verificationResult != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.check_circle, color: Color(0xFF047857), size: 28),
                        SizedBox(width: 8),
                        Text('VERIFIED STATUTORY SEAL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('Certificate: ${_verificationResult!['certificateNumber']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Instrument: ${_verificationResult!['instrument']?['serialNumber']}'),
                    Text('Trader: ${_verificationResult!['trader']?['fullName']}'),
                    Text('Valid Until: ${_verificationResult!['validUntil']}'),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => setState(() => _verificationResult = null),
                        child: const Text('Scan Another Seal'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
