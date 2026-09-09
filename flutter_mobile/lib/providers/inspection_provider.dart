import 'package:flutter/material.dart';
import '../data/models/assigned_job.dart';
import '../data/models/offline_inspection.dart';
import '../data/local_db.dart';
import '../core/api_service.dart';

class InspectionProvider with ChangeNotifier {
  final ApiService apiService = ApiService();

  bool _isOfflineMode = false;
  bool get isOfflineMode => _isOfflineMode;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isSyncing = false;
  bool get isSyncing => _isSyncing;

  List<AssignedJob> _jobs = [];
  List<AssignedJob> get jobs => _jobs;

  List<OfflineInspection> _pendingQueue = [];
  List<OfflineInspection> get pendingQueue => _pendingQueue;

  String? _token;
  String? get token => _token;

  Map<String, dynamic>? _currentUser;
  Map<String, dynamic>? get currentUser => _currentUser;

  void toggleOfflineMode() {
    _isOfflineMode = !_isOfflineMode;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await apiService.login(email, password);
      _token = data['token'];
      _currentUser = data['user'];
      await refreshLocalData();
      if (!_isOfflineMode) {
        await downloadAssignedJobs();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshLocalData() async {
    _jobs = await LocalDatabase.instance.getCachedJobs();
    _pendingQueue = await LocalDatabase.instance.getPendingInspections();
    notifyListeners();
  }

  Future<int> downloadAssignedJobs() async {
    if (_isOfflineMode) return 0;
    _isLoading = true;
    notifyListeners();
    try {
      _jobs = await apiService.downloadAssignedJobs();
      return _jobs.length;
    } catch (e) {
      debugPrint('Failed downloading assignments: $e');
      _jobs = await LocalDatabase.instance.getCachedJobs();
      return _jobs.length;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveInspection(OfflineInspection inspection) async {
    await LocalDatabase.instance.saveInspection(inspection);
    await refreshLocalData();
  }

  Future<String> syncPendingQueue() async {
    if (_isOfflineMode) {
      return 'Cannot sync while in offline mode. Please enable network connectivity.';
    }
    _isSyncing = true;
    notifyListeners();
    try {
      final res = await apiService.syncOfflineQueue();
      await refreshLocalData();
      return res['message'] ?? 'Sync completed successfully.';
    } catch (e) {
      return 'Sync error: $e';
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }
}
