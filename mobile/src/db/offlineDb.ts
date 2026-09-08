import Dexie, { Table } from 'dexie';

export interface AssignedJob {
  id: string;
  applicationNumber: string;
  type: string;
  status: string;
  traderName: string;
  traderPhone: string;
  installationAddress: string;
  instrumentSerial: string;
  instrumentCategory: string;
  makeAndModel: string;
  capacity: string;
  accuracyClass: string;
  scheduledDate?: string;
}

export interface OfflineInspection {
  id?: number;
  offlineSyncId: string;
  applicationId: string;
  applicationNumber: string;
  instrumentSerial: string;
  traderName: string;
  visualCheckPassed: boolean;
  repeatabilityCheckPassed: boolean;
  eccentricityErrorMm: number;
  maxPermissibleErrorMpe: number;
  observedError: number;
  testWeightsUsed: string;
  securitySealNumber: string;
  photoEvidenceBase64?: string;
  result: 'PASS' | 'FAIL';
  officerNotes: string;
  recordedAt: string;
  syncStatus: 'PENDING' | 'SYNCED' | 'CONFLICT';
  errorMessage?: string;
}

export class ScaleCheckOfflineDatabase extends Dexie {
  assignedJobs!: Table<AssignedJob, string>;
  offlineInspections!: Table<OfflineInspection, number>;

  constructor() {
    super('ScaleCheckOfflineFieldDB');
    this.version(1).stores({
      assignedJobs: 'id, applicationNumber, instrumentSerial, status',
      offlineInspections: '++id, offlineSyncId, applicationId, syncStatus, recordedAt'
    });
  }
}

export const offlineDb = new ScaleCheckOfflineDatabase();
