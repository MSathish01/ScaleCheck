class OfflineInspection {
  final String id;
  final String applicationId;
  final String instrumentSerial;
  final bool visualCheckPassed;
  final bool repeatabilityCheckPassed;
  final double eccentricityErrorMm;
  final double maxPermissibleErrorMpe;
  final double observedError;
  final String testWeightsUsed;
  final String securitySealNumber;
  final String result; // PASS, FAIL
  final String? officerNotes;
  final double geoLatitude;
  final double geoLongitude;
  final String? photoBase64;
  final String timestamp;
  final bool isSynced;

  OfflineInspection({
    required this.id,
    required this.applicationId,
    required this.instrumentSerial,
    required this.visualCheckPassed,
    required this.repeatabilityCheckPassed,
    required this.eccentricityErrorMm,
    required this.maxPermissibleErrorMpe,
    required this.observedError,
    required this.testWeightsUsed,
    required this.securitySealNumber,
    required this.result,
    this.officerNotes,
    required this.geoLatitude,
    required this.geoLongitude,
    this.photoBase64,
    required this.timestamp,
    this.isSynced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'applicationId': applicationId,
      'instrumentSerial': instrumentSerial,
      'visualCheckPassed': visualCheckPassed ? 1 : 0,
      'repeatabilityCheckPassed': repeatabilityCheckPassed ? 1 : 0,
      'eccentricityErrorMm': eccentricityErrorMm,
      'maxPermissibleErrorMpe': maxPermissibleErrorMpe,
      'observedError': observedError,
      'testWeightsUsed': testWeightsUsed,
      'securitySealNumber': securitySealNumber,
      'result': result,
      'officerNotes': officerNotes,
      'geoLatitude': geoLatitude,
      'geoLongitude': geoLongitude,
      'photoBase64': photoBase64,
      'timestamp': timestamp,
      'isSynced': isSynced ? 1 : 0,
    };
  }

  factory OfflineInspection.fromMap(Map<String, dynamic> map) {
    return OfflineInspection(
      id: map['id'],
      applicationId: map['applicationId'],
      instrumentSerial: map['instrumentSerial'] ?? '',
      visualCheckPassed: map['visualCheckPassed'] == 1,
      repeatabilityCheckPassed: map['repeatabilityCheckPassed'] == 1,
      eccentricityErrorMm: (map['eccentricityErrorMm'] as num).toDouble(),
      maxPermissibleErrorMpe: (map['maxPermissibleErrorMpe'] as num).toDouble(),
      observedError: (map['observedError'] as num).toDouble(),
      testWeightsUsed: map['testWeightsUsed'],
      securitySealNumber: map['securitySealNumber'],
      result: map['result'],
      officerNotes: map['officerNotes'],
      geoLatitude: (map['geoLatitude'] as num).toDouble(),
      geoLongitude: (map['geoLongitude'] as num).toDouble(),
      photoBase64: map['photoBase64'],
      timestamp: map['timestamp'],
      isSynced: map['isSynced'] == 1,
    );
  }

  // To API payload for batch sync
  Map<String, dynamic> toApiPayload() {
    return {
      'offlineSyncId': id,
      'applicationId': applicationId,
      'visualCheckPassed': visualCheckPassed,
      'repeatabilityCheckPassed': repeatabilityCheckPassed,
      'eccentricityErrorMm': eccentricityErrorMm,
      'maxPermissibleErrorMpe': maxPermissibleErrorMpe,
      'observedError': observedError,
      'testWeightsUsed': testWeightsUsed,
      'securitySealNumber': securitySealNumber,
      'result': result,
      'officerNotes': officerNotes,
      'geoLatitude': geoLatitude,
      'geoLongitude': geoLongitude,
    };
  }
}
