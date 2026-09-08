import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck,
  Calendar,
  AlertTriangle,
  Award,
  QrCode,
  Download,
  Lock,
  Compass,
  X
} from 'lucide-react';
import { applicationApi, inspectionApi, certificateApi, analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LmoWorkbench: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showInspectModal, setShowInspectModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Schedule Form State
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleRemarks, setScheduleRemarks] = useState<string>('');
  const [scheduling, setScheduling] = useState<boolean>(false);

  // Inspection Observation Form State
  const [visualCheckPassed, setVisualCheckPassed] = useState<boolean>(true);
  const [repeatabilityPassed, setRepeatabilityPassed] = useState<boolean>(true);
  const [eccentricityErrorMm, setEccentricityErrorMm] = useState<string>('0.0');
  const [maxPermissibleErrorMpe, setMaxPermissibleErrorMpe] = useState<string>('0.2');
  const [observedError, setObservedError] = useState<string>('0.04');
  const [testWeightsUsed, setTestWeightsUsed] = useState<string>('Class F1 Working Standard Stamped Weights');
  const [securitySealNumber, setSecuritySealNumber] = useState<string>(`DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
  const [result, setResult] = useState<string>('PASS');
  const [officerNotes, setOfficerNotes] = useState<string>('Verified and stamped in accordance with Legal Metrology Act, 2009.');
  const [submittingInspection, setSubmittingInspection] = useState<boolean>(false);

  // Issuance State
  const [issuingCertId, setIssuingCertId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        analyticsApi.getDashboard(),
        applicationApi.getAllocated()
      ]);
      setStats(statsRes.data?.data);
      setApplications(appsRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching LMO workbench data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setScheduling(true);
    try {
      await applicationApi.schedule({
        applicationId: selectedApp.id,
        scheduledDate: scheduleDate,
        remarks: scheduleRemarks
      });
      setShowScheduleModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule inspection.');
    } finally {
      setScheduling(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingInspection(true);
    try {
      await inspectionApi.record({
        applicationId: selectedApp.id,
        visualCheckPassed,
        repeatabilityCheckPassed: repeatabilityPassed,
        eccentricityErrorMm: parseFloat(eccentricityErrorMm),
        maxPermissibleErrorMpe: parseFloat(maxPermissibleErrorMpe),
        observedError: parseFloat(observedError),
        testWeightsUsed,
        securitySealNumber,
        result,
        officerNotes,
        geoLatitude: 11.9416,
        geoLongitude: 79.8083
      });
      setShowInspectModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record inspection.');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleIssueCertificate = async (appId: string) => {
    setIssuingCertId(appId);
    try {
      const res = await certificateApi.issue({
        applicationId: appId,
        validityMonths: 12
      });
      alert(`Certificate ${res.data?.data?.certificateNumber} successfully issued and cryptographically signed!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue certificate.');
    } finally {
      setIssuingCertId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase">
                Legal Metrology Enforcement Officer
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {user?.district}, {user?.state} Zone
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Field Officer Verification Workbench
            </h1>
            <p className="text-xs text-slate-500">
              Assigned verification inspections, statutory stamping records, and cryptographic certificate issuance.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Logged Officer</span>
            <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
          </div>
        </div>

        {/* Officer KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Assigned Pending Jobs</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-2">
              {stats?.assignedPending || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Scheduled or awaiting inspection</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Completed Inspections</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700 mt-2">
              {stats?.completedInspections || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tested with standard weights</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Certificates Signed</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.certificatesIssued || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active cryptographic seals</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Statutory Pass Rate</span>
              <FileCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              {stats?.passRate ?? 100}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Compliance pass ratio</div>
          </div>
        </div>

        {/* Allocated Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assigned Inspection Jobs</h3>
              <p className="text-xs text-slate-500">Record on-site findings, apply physical seals, and trigger digital certificate issuance</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Application ID</th>
                  <th className="py-3 px-6">Trader & Location</th>
                  <th className="py-3 px-6">Instrument Details</th>
                  <th className="py-3 px-6">Schedule</th>
                  <th className="py-3 px-6">Workflow Status</th>
                  <th className="py-3 px-6 text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-extrabold text-blue-900 text-sm">
                      {app.applicationNumber}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">{app.type}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.trader?.profile?.organizationName || app.trader?.fullName}</div>
                      <div className="text-[11px] text-slate-500">{app.trader?.fullName} ({app.trader?.phone})</div>
                      <div className="text-[10px] text-slate-400">{app.instrument?.installationAddress}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                      <div className="text-[11px] text-slate-600">{app.instrument?.makeAndModel}</div>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                          {app.instrument?.accuracyClass}
                        </span>
                        <span className="text-[10px] text-slate-500">{app.instrument?.capacity}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {app.scheduledDate ? (
                        <div>
                          <div className="font-bold text-slate-900">
                            {new Date(app.scheduledDate).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(app.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowScheduleModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold hover:bg-amber-100"
                        >
                          Set Schedule
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide ${
                          app.status === 'CERTIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'INSPECTION_COMPLETED'
                            ? 'bg-teal-100 text-teal-800'
                            : app.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                      {app.inspection && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Seal: <span className="font-mono font-bold text-slate-800">{app.inspection.securitySealNumber}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {app.status === 'SCHEDULED' && !app.inspection && (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowInspectModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 font-bold shadow-xs text-xs"
                        >
                          Record Observation
                        </button>
                      )}

                      {app.status === 'INSPECTION_COMPLETED' && !app.certificate && (
                        <button
                          onClick={() => handleIssueCertificate(app.id)}
                          disabled={issuingCertId === app.id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-xs text-xs disabled:opacity-50"
                        >
                          {issuingCertId === app.id ? 'Signing...' : 'Issue Certificate'}
                        </button>
                      )}

                      {app.certificate && (
                        <a
                          href={`/verify/${app.certificate.certificateNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold hover:bg-emerald-100 text-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View QR Seal</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Field Inspection</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Inspection Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Special Instructions for Trader</label>
                <textarea
                  rows={2}
                  value={scheduleRemarks}
                  onChange={(e) => setScheduleRemarks(e.target.value)}
                  placeholder="e.g. Ensure platform is clean and clear of goods before testing."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800"
                >
                  {scheduling ? 'Saving...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Inspection Observation Modal */}
      {showInspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Statutory Inspection Observations</h3>
                <p className="text-xs text-slate-500">Legal Metrology (General) Rules, 2011 Schedule Verification</p>
              </div>
              <button onClick={() => setShowInspectModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs font-medium">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">App: </span>
                  <span className="font-mono font-bold text-slate-900">{selectedApp?.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Instrument: </span>
                  <span className="font-bold text-slate-900">{selectedApp?.instrument?.serialNumber}</span>
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={visualCheckPassed}
                    onChange={(e) => setVisualCheckPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span>Visual & Physical Check Passed (Markings intact)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={repeatabilityPassed}
                    onChange={(e) => setRepeatabilityPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span>Repeatability & Zero-Load Return Nominal</span>
                </label>
              </div>

              {/* Errors & Tolerances */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Permissible Error (MPE)</label>
                  <input
                    type="text"
                    required
                    value={maxPermissibleErrorMpe}
                    onChange={(e) => setMaxPermissibleErrorMpe(e.target.value)}
                    placeholder="±0.20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Observed Test Error</label>
                  <input
                    type="text"
                    required
                    value={observedError}
                    onChange={(e) => setObservedError(e.target.value)}
                    placeholder="0.04"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Eccentricity (mm/g)</label>
                  <input
                    type="text"
                    value={eccentricityErrorMm}
                    onChange={(e) => setEccentricityErrorMm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Working Standard Weights / Measures Used</label>
                <input
                  type="text"
                  required
                  value={testWeightsUsed}
                  onChange={(e) => setTestWeightsUsed(e.target.value)}
                  placeholder="e.g. Working Standards F1 Stamped Set Serial #PY-WS-991"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Physical Seal Mark Number</label>
                  <input
                    type="text"
                    required
                    value={securitySealNumber}
                    onChange={(e) => setSecuritySealNumber(e.target.value)}
                    placeholder="e.g. DOCA-SL-91024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Statutory Verification Result</label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold"
                  >
                    <option value="PASS">PASS — Stamped & Verified</option>
                    <option value="FAIL">FAIL — Exceeds Error Limits (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Officer Statutory Notes</label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Inspection observation summary"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition"
                >
                  {submittingInspection ? 'Submitting...' : 'Record Statutory Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
