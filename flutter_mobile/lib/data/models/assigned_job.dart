class AssignedJob {
  final String id;
  final String applicationNumber;
  final String type;
  final String status;
  final String traderName;
  final String traderPhone;
  final String premisesAddress;
  final String instrumentSerial;
  final String instrumentModel;
  final String category;
  final String accuracyClass;
  final String capacity;
  final String? scheduledDate;
  final String? remarks;
  final String? rejectionReason;
  final String? securitySealNumber;

  AssignedJob({
    required this.id,
    required this.applicationNumber,
    required this.type,
    required this.status,
    required this.traderName,
    required this.traderPhone,
    required this.premisesAddress,
    required this.instrumentSerial,
    required this.instrumentModel,
    required this.category,
    required this.accuracyClass,
    required this.capacity,
    this.scheduledDate,
    this.remarks,
    this.rejectionReason,
    this.securitySealNumber,
  });

  factory AssignedJob.fromJson(Map<String, dynamic> json) {
    final trader = json['trader'] ?? {};
    final instrument = json['instrument'] ?? {};
    final inspection = json['inspection'] ?? {};

    return AssignedJob(
      id: json['id'] ?? '',
      applicationNumber: json['applicationNumber'] ?? '',
      type: json['type'] ?? 'PERIODIC_REVERIFICATION',
      status: json['status'] ?? 'SUBMITTED',
      traderName: trader['fullName'] ?? trader['profile']?['organizationName'] ?? 'Commercial Trader',
      traderPhone: trader['phone'] ?? '',
      premisesAddress: instrument['installationAddress'] ?? '',
      instrumentSerial: instrument['serialNumber'] ?? '',
      instrumentModel: instrument['makeAndModel'] ?? '',
      category: instrument['category'] ?? 'NAWI_ELECTRONIC',
      accuracyClass: instrument['accuracyClass'] ?? 'CLASS_III',
      capacity: instrument['capacity'] ?? '30 kg',
      scheduledDate: json['scheduledDate'],
      remarks: json['remarks'],
      rejectionReason: json['rejectionReason'],
      securitySealNumber: inspection['securitySealNumber'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'applicationNumber': applicationNumber,
      'type': type,
      'status': status,
      'traderName': traderName,
      'traderPhone': traderPhone,
      'premisesAddress': premisesAddress,
      'instrumentSerial': instrumentSerial,
      'instrumentModel': instrumentModel,
      'category': category,
      'accuracyClass': accuracyClass,
      'capacity': capacity,
      'scheduledDate': scheduledDate,
      'remarks': remarks,
      'rejectionReason': rejectionReason,
      'securitySealNumber': securitySealNumber,
    };
  }

  factory AssignedJob.fromMap(Map<String, dynamic> map) {
    return AssignedJob(
      id: map['id'],
      applicationNumber: map['applicationNumber'],
      type: map['type'] ?? 'PERIODIC_REVERIFICATION',
      status: map['status'] ?? 'SUBMITTED',
      traderName: map['traderName'] ?? '',
      traderPhone: map['traderPhone'] ?? '',
      premisesAddress: map['premisesAddress'] ?? '',
      instrumentSerial: map['instrumentSerial'] ?? '',
      instrumentModel: map['instrumentModel'] ?? '',
      category: map['category'] ?? '',
      accuracyClass: map['accuracyClass'] ?? '',
      capacity: map['capacity'] ?? '',
      scheduledDate: map['scheduledDate'],
      remarks: map['remarks'],
      rejectionReason: map['rejectionReason'],
      securitySealNumber: map['securitySealNumber'],
    );
  }
}
