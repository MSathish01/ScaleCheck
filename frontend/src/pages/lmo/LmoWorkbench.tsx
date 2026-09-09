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
  X,
  Edit3,
  FileText,
  Sparkles,
  Eye,
  RefreshCw,
  AlertCircle,
  Printer
} from 'lucide-react';
import { applicationApi, inspectionApi, certificateApi, analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AppointmentScheduler } from '../../components/AppointmentScheduler';

export const LmoWorkbench: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showInspectModal, setShowInspectModal] = useState<boolean>(false);
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [showObservationModal, setShowObservationModal] = useState<boolean>(false);
  const [isEditingInspection, setIsEditingInspection] = useState<boolean>(false);
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

  const handleOpenNewInspection = (app: any) => {
    setSelectedApp(app);
    setIsEditingInspection(false);
    setVisualCheckPassed(true);
    setRepeatabilityPassed(true);
    setEccentricityErrorMm('0.0');
    setMaxPermissibleErrorMpe('0.2');
    setObservedError('0.04');
    setTestWeightsUsed('Class F1 Working Standard Stamped Weights (Serial #CW-992)');
    setSecuritySealNumber(`DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
    setResult('PASS');
    setOfficerNotes('Verified and stamped in accordance with Legal Metrology Act, 2009.');
    setShowInspectModal(true);
  };

  const handleOpenEditInspection = (app: any) => {
    setSelectedApp(app);
    setIsEditingInspection(true);
    if (app.inspection) {
      setVisualCheckPassed(app.inspection.visualCheckPassed ?? true);
      setRepeatabilityPassed(app.inspection.repeatabilityCheckPassed ?? true);
      setEccentricityErrorMm(String(app.inspection.eccentricityErrorMm ?? '0.0'));
      setMaxPermissibleErrorMpe(String(app.inspection.maxPermissibleErrorMpe ?? '0.2'));
      setObservedError(String(app.inspection.observedError ?? '0.04'));
      setTestWeightsUsed(app.inspection.testWeightsUsed || 'Class F1 Working Standard Stamped Weights');
      setSecuritySealNumber(app.inspection.securitySealNumber || `DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
      setResult(app.inspection.result === 'PASS' ? 'PASS' : 'FAIL');
      setOfficerNotes(app.inspection.officerNotes || app.rejectionReason || 'Re-inspected following repair/recalibration.');
    } else {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.0');
      setMaxPermissibleErrorMpe('0.2');
      setObservedError('0.04');
      setTestWeightsUsed('Class F1 Working Standard Stamped Weights');
      setSecuritySealNumber(`DOCA-SL-${Math.floor(10000 + Math.random() * 90000)}`);
      setResult(app.status === 'REJECTED' ? 'FAIL' : 'PASS');
      setOfficerNotes(app.rejectionReason || 'Re-inspected and findings updated.');
    }
    setShowRejectionModal(false);
    setShowInspectModal(true);
  };

  const handleOpenRejectionMemo = (app: any) => {
    setSelectedApp(app);
    setShowRejectionModal(true);
  };

  const handleOpenObservationDetails = (app: any) => {
    setSelectedApp(app);
    setShowObservationModal(true);
  };

  const applyObservationPreset = (type: 'PASS' | 'MARGINAL' | 'FAIL') => {
    if (type === 'PASS') {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.00');
      setMaxPermissibleErrorMpe('0.20');
      setObservedError('0.02');
      setResult('PASS');
      setOfficerNotes('Fully conforming. Stamped and cleared for commercial custody transfer.');
    } else if (type === 'MARGINAL') {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.05');
      setMaxPermissibleErrorMpe('0.20');
      setObservedError('0.15');
      setResult('PASS');
      setOfficerNotes('Within permissible limit (±0.20g). Advised scheduled servicing.');
    } else {
      setVisualCheckPassed(false);
      setRepeatabilityPassed(false);
      setEccentricityErrorMm('0.40');
      setMaxPermissibleErrorMpe('0.20');
      setObservedError('0.68');
      setResult('FAIL');
      setOfficerNotes('REJECTED: Observed error (+0.68g) exceeds MPE limit (±0.20g). Seal seized under Section 24 of LM Act, 2009.');
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingInspection(true);
    try {
      const payload = {
        applicationId: selectedApp.id,
        visualCheckPassed,
        repeatabilityCheckPassed: repeatabilityPassed,
        eccentricityErrorMm: parseFloat(eccentricityErrorMm) || 0,
        maxPermissibleErrorMpe: parseFloat(maxPermissibleErrorMpe) || 0.2,
        observedError: parseFloat(observedError) || 0,
        testWeightsUsed,
        securitySealNumber,
        result: result === 'PASS' ? 'PASS' : 'FAIL',
        officerNotes,
        geoLatitude: 11.9416,
        geoLongitude: 79.8083,
        isUpdate: isEditingInspection,
        allowUpdate: true
      };

      if (isEditingInspection && selectedApp.inspection?.id) {
        await inspectionApi.update(selectedApp.inspection.id, payload);
      } else {
        await inspectionApi.record(payload);
      }

      setShowInspectModal(false);
      setIsEditingInspection(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record/update inspection observations.');
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
                Officer Workbench
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Jurisdiction: {user?.district || 'Puducherry Central'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Field Verification & Inspection Queue
            </h1>
            <p className="text-xs text-slate-500">
              Assigned statutory inspections, standards stamping, and cryptographic certificate issuance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Inspecting Officer</div>
              <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Assigned Pending</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {stats?.assignedPending || applications.filter(a => a.status === 'SUBMITTED' || a.status === 'ALLOCATED' || a.status === 'SCHEDULED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Visits requiring inspection</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Completed Visits</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-2">
              {stats?.completedInspections || applications.filter(a => a.status === 'INSPECTION_COMPLETED' || a.status === 'CERTIFIED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Physical tests executed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Certificates Signed</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.certificatesIssued || applications.filter(a => a.status === 'CERTIFIED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Asymmetrically stamped</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Rejections / Non-Compliant</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-2">
              {applications.filter(a => a.status === 'REJECTED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Statutory notice Form VIII issued</div>
          </div>
        </div>

        {/* Assigned Inspection Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assigned Inspection Jobs</h3>
              <p className="text-xs text-slate-500">Record on-site findings, apply physical seals, and trigger digital certificate issuance</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
              {applications.length} Assignments
            </span>
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
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No inspection jobs allocated in your jurisdiction currently.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-blue-900">{app.applicationNumber}</div>
                        <div className="text-[11px] text-slate-400">{app.type}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{app.trader?.profile?.organizationName || app.trader?.fullName}</div>
                        <div className="text-slate-500">{app.trader?.fullName} ({app.trader?.phone})</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{app.instrument?.installationAddress}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                        <div className="text-slate-600">{app.instrument?.makeAndModel}</div>
                        <div className="flex gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                            {app.instrument?.accuracyClass}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {app.instrument?.capacity}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {app.scheduledDate ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {new Date(app.scheduledDate).toLocaleDateString('en-IN')}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {new Date(app.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowScheduleModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-bold hover:bg-amber-100 transition cursor-pointer"
                          >
                            Set Schedule
                          </button>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide inline-flex items-center gap-1 ${
                            app.status === 'CERTIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : app.status === 'INSPECTION_COMPLETED'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : app.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {app.status}
                        </span>

                        {(app.inspection?.securitySealNumber || app.rejectionReason) && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {app.inspection?.securitySealNumber && (
                              <span>Seal: <span className="font-mono font-bold text-slate-800">{app.inspection.securitySealNumber}</span></span>
                            )}
                            {app.status === 'REJECTED' && app.rejectionReason && (
                              <div className="text-rose-700 font-medium truncate max-w-xs" title={app.rejectionReason}>
                                {app.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {/* Dynamic Action Buttons for All States */}
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. SCHEDULED / ALLOCATED */}
                          {(app.status === 'SCHEDULED' || app.status === 'ALLOCATED') && !app.inspection && (
                            <button
                              onClick={() => handleOpenNewInspection(app)}
                              className="px-3 py-1.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 font-bold shadow-xs text-xs transition cursor-pointer"
                            >
                              Record Observation
                            </button>
                          )}

                          {/* 2. REJECTED: Notice + Edit / Re-Inspect Options */}
                          {app.status === 'REJECTED' && (
                            <>
                              <button
                                onClick={() => handleOpenRejectionMemo(app)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-bold text-xs transition cursor-pointer shadow-2xs"
                                title="View Statutory Rejection Notice (Form VIII)"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejection Notice</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditInspection(app)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-bold text-xs transition cursor-pointer shadow-2xs"
                                title="Re-Inspect scale or amend recorded findings"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                <span>Edit / Re-Inspect</span>
                              </button>
                            </>
                          )}

                          {/* 3. INSPECTION_COMPLETED: Issue Cert + Edit + View */}
                          {app.status === 'INSPECTION_COMPLETED' && !app.certificate && (
                            <>
                              <button
                                onClick={() => handleIssueCertificate(app.id)}
                                disabled={issuingCertId === app.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-xs text-xs disabled:opacity-50 transition cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{issuingCertId === app.id ? 'Signing...' : 'Issue Certificate'}</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditInspection(app)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                title="Edit Observations"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenObservationDetails(app)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                title="View Recorded Findings"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* 4. CERTIFIED: QR Seal + Findings Sheet + Edit Notes */}
                          {app.certificate && (
                            <>
                              <a
                                href={`/verify/${app.certificate.certificateNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold hover:bg-emerald-100 text-xs transition"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>View QR Seal</span>
                              </a>
                              <button
                                onClick={() => handleOpenObservationDetails(app)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                title="View Recorded Technical Findings"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditInspection(app)}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title="Edit / Amend Observation Notes"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Field Inspection</h3>
                <p className="text-xs text-slate-500">Coordinate on-site testing appointment with trader</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {selectedApp && (
              <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trader:</span>
                  <span className="font-bold text-slate-900">{selectedApp.trader?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Premises:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedApp.instrument?.installationAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instrument:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedApp.instrument?.serialNumber}</span>
                </div>
                {selectedApp.remarks && (
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <span className="block text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                      Trader Preferred Slot & Request:
                    </span>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium mt-1">
                      {selectedApp.remarks}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-medium">
              <AppointmentScheduler
                value={scheduleDate}
                onChange={(val) => setScheduleDate(val)}
                label="Confirmed Statutory Inspection Window"
                description="Official Legal Metrology inspection appointment communicated to the trader."
              />
              <div>
                <label className="block text-slate-700 font-bold mb-1">Officer Notes & Working Standards Notice</label>
                <textarea
                  rows={2}
                  value={scheduleRemarks}
                  onChange={(e) => setScheduleRemarks(e.target.value)}
                  placeholder="e.g. Inspecting with standard 20kg M1 weights. Please ensure scale platform is clear."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-sm cursor-pointer"
                >
                  {scheduling ? 'Updating Schedule...' : 'Confirm & Notify Trader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Digital Inspection Observation / Edit Observation Modal */}
      {showInspectModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditingInspection ? 'Edit / Re-Inspect Statutory Observations' : 'Record Statutory Inspection Observations'}
                  </h3>
                  {isEditingInspection && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Edit Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Legal Metrology (General) Rules, 2011 Schedule Verification</p>
              </div>
              <button onClick={() => setShowInspectModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center justify-between p-2.5 mb-4 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Presets:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => applyObservationPreset('PASS')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ✓ Conforming (Pass)
                </button>
                <button
                  type="button"
                  onClick={() => applyObservationPreset('MARGINAL')}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ⚠️ Marginal
                </button>
                <button
                  type="button"
                  onClick={() => applyObservationPreset('FAIL')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ✕ Reject (Exceeds MPE)
                </button>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={visualCheckPassed}
                    onChange={(e) => setVisualCheckPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span>Visual & Physical Check Passed (Markings intact)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-blue-900"
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
                    <option value="PASS">PASS — Stamped & Verified (Issue Cert)</option>
                    <option value="FAIL">FAIL — Exceeds Error Limits (Reject)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Officer Statutory Notes & Findings</label>
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className={`px-5 py-2 rounded-xl font-bold text-white transition shadow-sm cursor-pointer ${
                    result === 'PASS' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-rose-700 hover:bg-rose-600'
                  }`}
                >
                  {submittingInspection
                    ? 'Saving...'
                    : isEditingInspection
                    ? 'Save & Update Observations'
                    : 'Record Statutory Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Statutory Rejection Notice Modal (FORM VIII) */}
      {showRejectionModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-200">
            {/* Gov Banner */}
            <div className="border-b border-rose-100 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                      Form VIII • Section 24, Legal Metrology Act, 2009
                    </span>
                    <h3 className="text-lg font-black text-slate-900">Statutory Rejection Notice</h3>
                  </div>
                </div>
                <button onClick={() => setShowRejectionModal(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official notice of verification rejection and non-conformance of measuring instrument
              </p>
            </div>

            {/* Instrument & Trader Info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Application Reference</span>
                <span className="font-mono font-bold text-blue-900">{selectedApp.applicationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Instrument Serial</span>
                <span className="font-mono font-bold text-slate-900">{selectedApp.instrument?.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Commercial Trader</span>
                <span className="font-bold text-slate-900">{selectedApp.trader?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Premises Location</span>
                <span className="text-slate-700 truncate block">{selectedApp.instrument?.installationAddress}</span>
              </div>
            </div>

            {/* Grounds for Rejection */}
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs space-y-2 mb-4">
              <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Statutory Reason for Rejection:
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-rose-950 font-semibold font-mono text-xs">
                {selectedApp.rejectionReason || selectedApp.inspection?.officerNotes || 'Observed test error exceeded maximum permissible statutory error (MPE) tolerances under Schedule VI.'}
              </div>

              {selectedApp.inspection && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Observed Error:</span>
                    <span className="font-bold text-rose-700 font-mono">+{selectedApp.inspection.observedError}g</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MPE Limit:</span>
                    <span className="font-bold text-slate-700 font-mono">±{selectedApp.inspection.maxPermissibleErrorMpe}g</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Seal Recorded:</span>
                    <span className="font-mono text-slate-700">{selectedApp.inspection.securitySealNumber || 'WITHHELD'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Directive */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1 mb-5">
              <span className="font-extrabold block">⚖️ Legal Enforcement Directive:</span>
              <p>
                Under Section 24 of the Legal Metrology Act, 2009, this measuring instrument is strictly barred from commercial transactions.
                The trader is hereby granted a <strong>7-day statutory rectification period</strong> to have this instrument adjusted by a licensed repairer and request re-verification.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Notice</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditInspection(selectedApp)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Re-Inspect / Edit Observation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Inspection Observation Findings Sheet Modal */}
      {showObservationModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Statutory Inspection Observation Sheet</h3>
                  <p className="text-xs text-slate-500">Legal Metrology field verification record and tolerances</p>
                </div>
              </div>
              <button onClick={() => setShowObservationModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Application Number:</span>
                <span className="font-mono font-bold text-blue-900">{selectedApp.applicationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrument Serial:</span>
                <span className="font-mono font-bold text-slate-900">{selectedApp.instrument?.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Make & Model:</span>
                <span className="font-bold text-slate-800">{selectedApp.instrument?.makeAndModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premises:</span>
                <span className="font-medium text-slate-700 truncate max-w-xs">{selectedApp.instrument?.installationAddress}</span>
              </div>
            </div>

            {/* Findings Grid */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs mb-4">
              <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 border-b border-slate-200">
                Test Parameters & Standards Conformance
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Visual & Physical Housing:</span>
                  <span className={`font-bold ${selectedApp.inspection?.visualCheckPassed !== false ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedApp.inspection?.visualCheckPassed !== false ? '✓ Passed (Intact)' : '✕ Non-Conforming'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Repeatability & Zero-Return:</span>
                  <span className={`font-bold ${selectedApp.inspection?.repeatabilityCheckPassed !== false ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedApp.inspection?.repeatabilityCheckPassed !== false ? '✓ Passed (Nominal)' : '✕ Failure'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Statutory MPE Limit:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ±{selectedApp.inspection?.maxPermissibleErrorMpe ?? '0.20'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Observed Test Error:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {selectedApp.inspection?.observedError ?? '0.04'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Eccentricity (Corner Load):</span>
                  <span className="font-mono font-bold text-slate-700">
                    {selectedApp.inspection?.eccentricityErrorMm ?? '0.0'} mm
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Physical Seal Applied:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedApp.inspection?.securitySealNumber || 'DOCA-SL-PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Working Standard Weights Used:</span>
                  <span className="font-medium text-slate-800 block bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {selectedApp.inspection?.testWeightsUsed || 'Standard Class F1 Stamped Weights'}
                  </span>
                </div>
                {selectedApp.inspection?.officerNotes && (
                  <div>
                    <span className="text-slate-500 block mb-1">Officer Findings:</span>
                    <span className="italic text-slate-700 block bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{selectedApp.inspection.officerNotes}"
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setShowObservationModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowObservationModal(false);
                  handleOpenEditInspection(selectedApp);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit / Amend Findings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
