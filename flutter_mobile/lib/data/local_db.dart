import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart' as sqflite;
import 'package:path/path.dart' as p;
import 'models/assigned_job.dart';
import 'models/offline_inspection.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static sqflite.Database? _database;

  LocalDatabase._init();

  Future<sqflite.Database?> get database async {
    if (kIsWeb) return null;
    if (_database != null) return _database!;
    _database = await _initDB('scalecheck_offline.db');
    return _database!;
  }

  Future<sqflite.Database> _initDB(String filePath) async {
    final dbPath = await sqflite.getDatabasesPath();
    final path = p.join(dbPath, filePath);

    return await sqflite.openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Table 1: Cached Assigned Jobs
        await db.execute('''
          CREATE TABLE assigned_jobs (
            id TEXT PRIMARY KEY,
            applicationNumber TEXT,
            type TEXT,
            status TEXT,
            traderName TEXT,
            traderPhone TEXT,
            premisesAddress TEXT,
            instrumentSerial TEXT,
            instrumentModel TEXT,
            category TEXT,
            accuracyClass TEXT,
            capacity TEXT,
            scheduledDate TEXT,
            remarks TEXT,
            rejectionReason TEXT,
            securitySealNumber TEXT
          )
        ''');

        // Table 2: Queued Offline Inspections
        await db.execute('''
          CREATE TABLE offline_inspections (
            id TEXT PRIMARY KEY,
            applicationId TEXT,
            instrumentSerial TEXT,
            visualCheckPassed INTEGER,
            repeatabilityCheckPassed INTEGER,
            eccentricityErrorMm REAL,
            maxPermissibleErrorMpe REAL,
            observedError REAL,
            testWeightsUsed TEXT,
            securitySealNumber TEXT,
            result TEXT,
            officerNotes TEXT,
            geoLatitude REAL,
            geoLongitude REAL,
            photoBase64 TEXT,
            timestamp TEXT,
            isSynced INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  static final List<AssignedJob> _defaultInitialJobs = [
    AssignedJob(
      id: 'app-wb-001',
      applicationNumber: 'PY-VR-2026-00412',
      type: 'PERIODIC_REVERIFICATION',
      status: 'SCHEDULED',
      traderName: 'Sri Lakshmi Modern Rice Mill',
      traderPhone: '+91 98401 23456',
      premisesAddress: 'Plot 42, Mettupalayam Industrial Estate, Puducherry - 605009',
      instrumentSerial: 'WB-60T-2023-881',
      instrumentModel: 'Avery Weigh-Tronix Pitless 60T',
      category: 'WEIGHBRIDGE',
      accuracyClass: 'CLASS_III',
      capacity: '60 Metric Tonne',
      scheduledDate: '2026-09-14',
      remarks: 'Annual statutory re-verification for commercial paddy trade.',
    ),
    AssignedJob(
      id: 'app-rt-002',
      applicationNumber: 'PY-VR-2026-00415',
      type: 'INITIAL_VERIFICATION',
      status: 'SCHEDULED',
      traderName: 'Nilgiris Supermarket (Heritage Retail)',
      traderPhone: '+91 98412 87654',
      premisesAddress: 'No. 18, Mission Street, White Town, Puducherry - 605001',
      instrumentSerial: 'ES-30KG-9014',
      instrumentModel: 'Essae DS-215 Electronic Counter Scale',
      category: 'NAWI_ELECTRONIC',
      accuracyClass: 'CLASS_III',
      capacity: '30 kg (e=5g)',
      scheduledDate: '2026-09-14',
      remarks: 'New POS checkout counter scale installation inspection.',
    ),
    AssignedJob(
      id: 'app-fm-003',
      applicationNumber: 'PY-VR-2026-00398',
      type: 'SURPRISE_ENFORCEMENT',
      status: 'REJECTED',
      traderName: 'Bharat Petroleum Highway Outlet',
      traderPhone: '+91 97900 11223',
      premisesAddress: 'NH-45A Villupuram Highway, Ariyankuppam, Puducherry',
      instrumentSerial: 'DU-MPD-4412',
      instrumentModel: 'Midco MPD Electronic Fuel Dispenser',
      category: 'FLOW_METER',
      accuracyClass: 'CLASS_0.5',
      capacity: '100 L/min',
      scheduledDate: '2026-09-13',
      rejectionReason: 'REJECTED under Sec 24: Calibration error +45mL/5L exceeds statutory MPE tolerance (±25mL). Stamping refused.',
    ),
  ];

  // --- Assigned Jobs Operations ---
  Future<void> cacheAssignedJobs(List<AssignedJob> jobs) async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      final list = jobs.map((j) => j.toMap()).toList();
      await prefs.setString('cached_assigned_jobs', jsonEncode(list));
      return;
    }

    final db = await instance.database;
    if (db == null) return;
    await db.delete('assigned_jobs'); // clear old cache
    for (var job in jobs) {
      await db.insert('assigned_jobs', job.toMap(), conflictAlgorithm: sqflite.ConflictAlgorithm.replace);
    }
  }

  Future<List<AssignedJob>> getCachedJobs() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      final str = prefs.getString('cached_assigned_jobs');
      if (str == null || str.isEmpty) {
        final initialJobs = _defaultInitialJobs;
        await cacheAssignedJobs(initialJobs);
        return initialJobs;
      }
      try {
        final List list = jsonDecode(str);
        return list.map((e) => AssignedJob.fromMap(Map<String, dynamic>.from(e))).toList();
      } catch (e) {
        return _defaultInitialJobs;
      }
    }

    final db = await instance.database;
    if (db == null) return _defaultInitialJobs;
    final maps = await db.query('assigned_jobs', orderBy: 'scheduledDate ASC');
    if (maps.isEmpty) {
      final initialJobs = _defaultInitialJobs;
      await cacheAssignedJobs(initialJobs);
      return initialJobs;
    }
    return maps.map((e) => AssignedJob.fromMap(e)).toList();
  }

  // --- Offline Inspections Queue Operations ---
  Future<void> saveInspection(OfflineInspection inspection) async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      final queueStr = prefs.getString('cached_offline_inspections') ?? '[]';
      List queueList = [];
      try {
        queueList = jsonDecode(queueStr);
      } catch (_) {}

      final inspMap = inspection.toMap();
      queueList.removeWhere((e) => e['id'] == inspection.id);
      queueList.add(inspMap);
      await prefs.setString('cached_offline_inspections', jsonEncode(queueList));

      // Also update cached job status locally
      final jobs = await getCachedJobs();
      final updatedJobs = jobs.map((j) {
        if (j.id == inspection.applicationId) {
          return AssignedJob(
            id: j.id,
            applicationNumber: j.applicationNumber,
            type: j.type,
            status: inspection.result == 'PASS' ? 'INSPECTION_COMPLETED' : 'REJECTED',
            traderName: j.traderName,
            traderPhone: j.traderPhone,
            premisesAddress: j.premisesAddress,
            instrumentSerial: j.instrumentSerial,
            instrumentModel: j.instrumentModel,
            category: j.category,
            accuracyClass: j.accuracyClass,
            capacity: j.capacity,
            scheduledDate: j.scheduledDate,
            remarks: j.remarks,
            rejectionReason: inspection.result == 'FAIL' ? inspection.officerNotes : null,
            securitySealNumber: inspection.securitySealNumber,
          );
        }
        return j;
      }).toList();
      await cacheAssignedJobs(updatedJobs);
      return;
    }

    final db = await instance.database;
    if (db == null) return;
    await db.insert('offline_inspections', inspection.toMap(), conflictAlgorithm: sqflite.ConflictAlgorithm.replace);

    // Also update cached job status locally
    await db.update(
      'assigned_jobs',
      {
        'status': inspection.result == 'PASS' ? 'INSPECTION_COMPLETED' : 'REJECTED',
        'securitySealNumber': inspection.securitySealNumber,
        'rejectionReason': inspection.result == 'FAIL' ? inspection.officerNotes : null,
      },
      where: 'id = ?',
      whereArgs: [inspection.applicationId],
    );
  }

  Future<List<OfflineInspection>> getPendingInspections() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      final queueStr = prefs.getString('cached_offline_inspections') ?? '[]';
      try {
        final List list = jsonDecode(queueStr);
        return list
            .where((e) => e['isSynced'] == 0 || e['isSynced'] == false)
            .map((e) => OfflineInspection.fromMap(Map<String, dynamic>.from(e)))
            .toList();
      } catch (_) {
        return [];
      }
    }

    final db = await instance.database;
    if (db == null) return [];
    final maps = await db.query('offline_inspections', where: 'isSynced = 0');
    return maps.map((e) => OfflineInspection.fromMap(e)).toList();
  }

  Future<void> markInspectionsSynced(List<String> ids) async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      final queueStr = prefs.getString('cached_offline_inspections') ?? '[]';
      try {
        List list = jsonDecode(queueStr);
        for (var item in list) {
          if (ids.contains(item['id'])) {
            item['isSynced'] = 1;
          }
        }
        await prefs.setString('cached_offline_inspections', jsonEncode(list));
      } catch (_) {}
      return;
    }

    final db = await instance.database;
    if (db == null) return;
    for (var id in ids) {
      await db.update('offline_inspections', {'isSynced': 1}, where: 'id = ?', whereArgs: [id]);
    }
  }
}
