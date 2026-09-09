import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'models/assigned_job.dart';
import 'models/offline_inspection.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('scalecheck_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
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

  // --- Assigned Jobs Operations ---
  Future<void> cacheAssignedJobs(List<AssignedJob> jobs) async {
    final db = await instance.database;
    await db.delete('assigned_jobs'); // clear old cache
    for (var job in jobs) {
      await db.insert('assigned_jobs', job.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
  }

  Future<List<AssignedJob>> getCachedJobs() async {
    final db = await instance.database;
    final maps = await db.query('assigned_jobs', orderBy: 'scheduledDate ASC');
    return maps.map((e) => AssignedJob.fromMap(e)).toList();
  }

  // --- Offline Inspections Queue Operations ---
  Future<void> saveInspection(OfflineInspection inspection) async {
    final db = await instance.database;
    await db.insert('offline_inspections', inspection.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);

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
    final db = await instance.database;
    final maps = await db.query('offline_inspections', where: 'isSynced = 0');
    return maps.map((e) => OfflineInspection.fromMap(e)).toList();
  }

  Future<void> markInspectionsSynced(List<String> ids) async {
    final db = await instance.database;
    for (var id in ids) {
      await db.update('offline_inspections', {'isSynced': 1}, where: 'id = ?', whereArgs: [id]);
    }
  }
}
