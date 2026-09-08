import axios from 'axios';
import { offlineDb, AssignedJob, OfflineInspection } from '../db/offlineDb';

const API_BASE = 'http://localhost:5000/api/v1';

export class MobileApiService {
  private static token: string | null = localStorage.getItem('scalecheck_mobile_token');

  public static async loginAsOfficer(): Promise<string> {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: 'lmo.puducherry@gov.in',
        password: 'Officer@123'
      });
      const token = res.data?.data?.token;
      this.token = token;
      localStorage.setItem('scalecheck_mobile_token', token);
      return token;
    } catch (err: any) {
      console.error('Failed to log in mobile officer:', err);
      throw err;
    }
  }

  public static async downloadAssignedJobs(): Promise<number> {
    if (!this.token) await this.loginAsOfficer();

    const res = await axios.get(`${API_BASE}/applications/allocated`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });

    const apps = res.data?.data || [];
    const jobsToStore: AssignedJob[] = apps.map((app: any) => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      type: app.type,
      status: app.status,
      traderName: app.trader?.fullName || 'Individual Trader',
      traderPhone: app.trader?.phone || '',
      installationAddress: app.instrument?.installationAddress || '',
      instrumentSerial: app.instrument?.serialNumber || '',
      instrumentCategory: app.instrument?.category || '',
      makeAndModel: app.instrument?.makeAndModel || '',
      capacity: app.instrument?.capacity || '',
      accuracyClass: app.instrument?.accuracyClass || '',
      scheduledDate: app.scheduledDate || undefined
    }));

    await offlineDb.assignedJobs.clear();
    await offlineDb.assignedJobs.bulkPut(jobsToStore);
    return jobsToStore.length;
  }

  public static async flushOfflineSyncQueue(): Promise<{ syncedCount: number; errors: any[] }> {
    if (!this.token) await this.loginAsOfficer();

    const pending = await offlineDb.offlineInspections
      .where('syncStatus')
      .equals('PENDING')
      .toArray();

    if (pending.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    const payload = pending.map((item) => ({
      applicationId: item.applicationId,
      visualCheckPassed: item.visualCheckPassed,
      repeatabilityCheckPassed: item.repeatabilityCheckPassed,
      eccentricityErrorMm: item.eccentricityErrorMm,
      maxPermissibleErrorMpe: item.maxPermissibleErrorMpe,
      observedError: item.observedError,
      testWeightsUsed: item.testWeightsUsed,
      securitySealNumber: item.securitySealNumber,
      result: item.result,
      officerNotes: item.officerNotes,
      offlineSyncId: item.offlineSyncId
    }));

    try {
      const res = await axios.post(
        `${API_BASE}/inspections/sync-offline`,
        { inspections: payload },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );

      const syncedIds: string[] = res.data?.data?.syncedIds || [];

      // Mark local DB records as SYNCED
      for (const item of pending) {
        if (syncedIds.includes(item.offlineSyncId) && item.id) {
          await offlineDb.offlineInspections.update(item.id, { syncStatus: 'SYNCED' });
          // Update status in assignedJobs
          await offlineDb.assignedJobs.update(item.applicationId, { status: 'INSPECTION_COMPLETED' });
        }
      }

      return {
        syncedCount: syncedIds.length,
        errors: res.data?.data?.errors || []
      };
    } catch (err: any) {
      console.error('Failed to flush offline queue:', err);
      throw err;
    }
  }
}
