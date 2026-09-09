import 'package:dio/dio.dart';
import '../data/models/assigned_job.dart';
import '../data/models/offline_inspection.dart';
import '../data/local_db.dart';

class ApiService {
  static const String defaultBaseUrl = 'http://10.0.2.2:5000/api/v1'; // 10.0.2.2 for Android Emulator
  late final Dio _dio;
  String? _authToken;

  ApiService({String baseUrl = defaultBaseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));
  }

  void setToken(String token) {
    _authToken = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  // --- Auth ---
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    if (response.data['success'] == true) {
      final token = response.data['data']['token'];
      setToken(token);
      return response.data['data'];
    }
    throw Exception(response.data['message'] ?? 'Login failed');
  }

  // --- Download Jobs to Local SQLite ---
  Future<List<AssignedJob>> downloadAssignedJobs() async {
    final response = await _dio.get('/applications/allocated');
    if (response.data['success'] == true) {
      final List rawList = response.data['data'] ?? [];
      final jobs = rawList.map((e) => AssignedJob.fromJson(e)).toList();
      await LocalDatabase.instance.cacheAssignedJobs(jobs);
      return jobs;
    }
    throw Exception('Failed to fetch allocated inspections');
  }

  // --- Upload / Sync Offline Queue ---
  Future<Map<String, dynamic>> syncOfflineQueue() async {
    final pending = await LocalDatabase.instance.getPendingInspections();
    if (pending.isEmpty) {
      return {'syncedCount': 0, 'message': 'Queue already synchronized'};
    }

    final payload = {
      'inspections': pending.map((e) => e.toApiPayload()).toList(),
    };

    final response = await _dio.post('/inspections/sync-offline', data: payload);
    if (response.data['success'] == true) {
      final syncedIds = (response.data['data']?['syncedIds'] as List?)?.cast<String>() ?? [];
      await LocalDatabase.instance.markInspectionsSynced(syncedIds);
      return {
        'syncedCount': syncedIds.length,
        'message': 'Successfully synced ${syncedIds.length} inspections with Department Ledger.',
      };
    }
    throw Exception(response.data['message'] ?? 'Sync failed');
  }

  // --- Public Certificate Verification by QR ---
  Future<Map<String, dynamic>> verifyCertificate(String certNumber) async {
    final response = await _dio.get('/certificates/verify/$certNumber');
    return response.data;
  }
}
