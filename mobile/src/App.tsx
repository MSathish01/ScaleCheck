import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  DownloadCloud,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Camera,
  MapPin,
  RefreshCw,
  X,
  FileText,
  User
} from 'lucide-react';
import { offlineDb, AssignedJob, OfflineInspection } from './db/offlineDb';
import { MobileApiService } from './services/mobileApi';

export const App: React.FC = () => {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [jobs, setJobs] = useState<AssignedJob[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineInspection[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Selected Job for Inspection Modal
  const [selectedJob, setSelectedJob] = useState<AssignedJob | null>(null);

  // Form State
  const [visualCheckPassed, setVisualCheckPassed] = useState<boolean>(true);
  const [repeatabilityCheckPassed, setRepeatabilityCheckPassed] = useState<boolean>(true);
  const [eccentricityErrorMm, setEccentricityErrorMm] = useState<string>('0.0');
  const [maxPermissibleErrorMpe, setMaxPermissibleErrorMpe] = useState<string>('0.2');
  const [observedError, setObservedError] = useState<string>('0.05');
  const [testWeightsUsed, setTestWeightsUsed] = useState<string>('Class F1 Working Standard Stamped Weights');
  const [securitySealNumber, setSecuritySealNumber] = useState<string>(`DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
  const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);
  const [result, setResult] = useState<'PASS' | 'FAIL'>('PASS');
  const [officerNotes, setOfficerNotes] = useState<string>('Tested on-site with certified standards. Lead seal applied.');
  const [savingOffline, setSavingOffline] = useState<boolean>(false);

  const loadLocalData = async () => {
    const localJobs = await offlineDb.assignedJobs.toArray();
    const localQueue = await offlineDb.offlineInspections.toArray();
    setJobs(localJobs);
    setOfflineQueue(localQueue);
  };

  useEffect(() => {
    loadLocalData();
    // Auto download on first load if online
    if (!isSimulatedOffline) {
      handleDownloadQueue();
    }
  }, []);

  const handleDownloadQueue = async () => {
    if (isSimulatedOffline) {
      alert('Cannot download while in offline mode. Turn on connectivity first.');
      return;
    }
    setDownloading(true);
    try {
      const count = await MobileApiService.downloadAssignedJobs();
      await loadLocalData();
      console.log(`Downloaded ${count} assigned jobs into local IndexedDB.`);
    } catch (err) {
      console.warn('Backend unavailable, using existing local IndexedDB records.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSyncQueue = async () => {
    if (isSimulatedOffline) {
      alert('Cannot sync while in simulated offline mode. Please switch to ONLINE mode first.');
      return;
    }
    setSyncing(true);
    try {
      const res = await MobileApiService.flushOfflineSyncQueue();
      await loadLocalData();
      alert(`Synchronized ${res.syncedCount} inspection(s) with Central Legal Metrology Database!`);
    } catch (err: any) {
      alert('Sync failed: ' + (err.message || 'Server unreachable'));
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveInspectionLocally = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSavingOffline(true);

    const offlineRecord: OfflineInspection = {
      offlineSyncId: `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      applicationId: selectedJob.id,
      applicationNumber: selectedJob.applicationNumber,
      instrumentSerial: selectedJob.instrumentSerial,
      traderName: selectedJob.traderName,
      visualCheckPassed,
      repeatabilityCheckPassed,
      eccentricityErrorMm: parseFloat(eccentricityErrorMm),
      maxPermissibleErrorMpe: parseFloat(maxPermissibleErrorMpe),
      observedError: parseFloat(observedError),
      testWeightsUsed,
      securitySealNumber,
      photoEvidenceBase64: photoCaptured ? 'data:image/jpeg;base64,placeholder_seal_evidence' : undefined,
      result,
      officerNotes,
      recordedAt: new Date().toISOString(),
      syncStatus: 'PENDING'
    };

    await offlineDb.offlineInspections.add(offlineRecord);
    // Optimistically update local assignedJob status
    await offlineDb.assignedJobs.update(selectedJob.id, { status: 'INSPECTION_COMPLETED' });

    await loadLocalData();
    setSavingOffline(false);
    setSelectedJob(null);

    // If online, auto trigger sync
    if (!isSimulatedOffline) {
      handleSyncQueue();
    } else {
      alert('Inspection observation saved to local device IndexedDB. Will sync automatically when connectivity returns.');
    }
  };

  const pendingCount = offlineQueue.filter((q) => q.syncStatus === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center py-0 sm:py-6 px-0 sm:px-4">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 sm:rounded-3xl shadow-2xl flex flex-col min-h-screen sm:min-h-[880px] overflow-hidden">
        {/* Device Status Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-white tracking-wider">ScaleCheck Field</span>
          </div>

          {/* Simulated Offline Toggle */}
          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition shadow-xs ${
              isSimulatedOffline
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isSimulatedOffline ? 'OFFLINE (Field)' : 'ONLINE'}</span>
          </button>
        </div>

        {/* Officer Header */}
        <div className="p-5 bg-gradient-to-br from-blue-950 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-blue-300 font-semibold">Legal Metrology Officer</div>
                <div className="text-sm font-extrabold text-white">Inspector M. Anbarasan</div>
                <div className="text-[10px] text-slate-400">Puducherry Central Zone</div>
              </div>
            </div>

            <button
              onClick={handleDownloadQueue}
              disabled={downloading}
              title="Cache assigned inspections before heading into field"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition border border-slate-700 disabled:opacity-50"
            >
              <DownloadCloud className={`w-4 h-4 text-blue-400 ${downloading ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Offline Sync Banner */}
          {pendingCount > 0 && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-200">
                  {pendingCount} Inspection(s) Queued Locally
                </span>
              </div>
              <button
                onClick={handleSyncQueue}
                disabled={syncing || isSimulatedOffline}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition flex items-center gap-1 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Jobs List Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Offline Assigned Jobs ({jobs.length})
            </span>
            <span className="text-[10px] text-slate-500">IndexedDB Synced</span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-500 text-xs">
              <Scale className="w-10 h-10 mx-auto opacity-40 text-blue-400" />
              <p>No offline jobs cached on device.</p>
              <button
                onClick={handleDownloadQueue}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Download Today's Assigned Queue
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-blue-400">
                      {job.applicationNumber}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {job.instrumentSerial}
                    </div>
                    <div className="text-xs text-slate-400">{job.makeAndModel}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      job.status === 'CERTIFIED' || job.status === 'INSPECTION_COMPLETED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-900 pt-2">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{job.traderName} ({job.traderPhone})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{job.installationAddress}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Capacity: <strong className="text-slate-300">{job.capacity}</strong></span>
                    <span>Class: <strong className="text-blue-300">{job.accuracyClass}</strong></span>
                  </div>
                </div>

                {job.status !== 'INSPECTION_COMPLETED' && job.status !== 'CERTIFIED' ? (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setSecuritySealNumber(`DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perform Field Inspection</span>
                  </button>
                ) : (
                  <div className="text-center py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Observation Completed</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500">
          Legal Metrology Act, 2009 | Offline-First Mobile Inspection Client
        </div>
      </div>

      {/* Field Inspection Recording Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Record Statutory Inspection</h3>
                <p className="text-[11px] text-slate-400">Zero Connectivity Offline Mode Supported</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInspectionLocally} className="space-y-3 text-xs font-medium">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Target Unit:</div>
                <div className="font-mono font-bold text-blue-400">{selectedJob.instrumentSerial}</div>
                <div className="text-slate-300 font-medium">{selectedJob.makeAndModel}</div>
                <div className="text-slate-500 text-[10px]">{selectedJob.capacity} — {selectedJob.accuracyClass}</div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualCheckPassed}
                    onChange={(e) => setVisualCheckPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800"
                  />
                  <span>Visual & Physical Markings Intact</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatabilityCheckPassed}
                    onChange={(e) => setRepeatabilityCheckPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800"
                  />
                  <span>Repeatability & Zero Return Passed</span>
                </label>
              </div>

              {/* Error Measurements */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">MPE Limit (±)</label>
                  <input
                    type="text"
                    required
                    value={maxPermissibleErrorMpe}
                    onChange={(e) => setMaxPermissibleErrorMpe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Observed Error</label>
                  <input
                    type="text"
                    required
                    value={observedError}
                    onChange={(e) => setObservedError(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Working Standards Used</label>
                <input
                  type="text"
                  required
                  value={testWeightsUsed}
                  onChange={(e) => setTestWeightsUsed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Physical Security Seal Mark No.</label>
                <input
                  type="text"
                  required
                  value={securitySealNumber}
                  onChange={(e) => setSecuritySealNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold"
                />
              </div>

              {/* Photo Capture Simulation */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Geo-Tagged Seal Photo Evidence</label>
                <button
                  type="button"
                  onClick={() => setPhotoCaptured(!photoCaptured)}
                  className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                    photoCaptured
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{photoCaptured ? 'Photo Attached (Geo-Tagged)' : 'Capture Seal Photo'}</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Statutory Finding</label>
                <select
                  value={result}
                  onChange={(e: any) => setResult(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="PASS">PASS — Comply with Statutory MPE</option>
                  <option value="FAIL">FAIL — Exceeds Error Tolerance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Officer Notes</label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOffline}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingOffline ? 'Saving Locally...' : 'Save Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
