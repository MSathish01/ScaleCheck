import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TestTube,
  CheckCircle2,
  Clock,
  Award,
  QrCode,
  Download,
  ShieldCheck,
  Calendar,
  X,
  Sparkles,
  ExternalLink,
  FileText,
  Check,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Edit3,
  Printer
} from 'lucide-react';
import { applicationApi, inspectionApi, certificateApi, analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AppointmentScheduler } from '../../components/AppointmentScheduler';

export const GatcWorkbench: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showInspectModal, setShowInspectModal] = useState<boolean>(false);
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [isEditingInspection, setIsEditingInspection] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Schedule Form State
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleRemarks, setScheduleRemarks] = useState<string>('');
  const [scheduling, setScheduling] = useState<boolean>(false);

  // Laboratory Calibration Form State
  const [visualCheckPassed, setVisualCheckPassed] = useState<boolean>(true);
  const [repeatabilityPassed, setRepeatabilityPassed] = useState<boolean>(true);
  const [eccentricityErrorMm, setEccentricityErrorMm] = useState<string>('0.01');
  const [maxPermissibleErrorMpe, setMaxPermissibleErrorMpe] = useState<string>('±0.20');
  const [observedError, setObservedError] = useState<string>('0.02');
  const [testWeightsUsed, setTestWeightsUsed] = useState<string>(
    'NABL Traceable Standard Mass Set (Class E2/F1) Serial #GATC-CAL-2026-09'
  );
  const [securitySealNumber, setSecuritySealNumber] = useState<string>('');
  const [ambientTemp, setAmbientTemp] = useState<string>('23.0°C');
  const [ambientHumidity, setAmbientHumidity] = useState<string>('52% RH');
  const [result, setResult] = useState<string>('PASSED');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [submittingInspection, setSubmittingInspection] = useState<boolean>(false);
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
      console.error('Error loading GATC data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenScheduleModal = (app: any) => {
    setSelectedApp(app);
    setScheduleRemarks(app.remarks ? `Noted trader requirements: "${app.remarks}"` : 'Calibration bench allocated. Working standard weights prepared.');
    if (app.preferredDate) {
      setScheduleDate(app.preferredDate);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      setScheduleDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00:00`);
    }
    setShowScheduleModal(true);
  };

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
      alert(err.response?.data?.message || 'Failed to schedule laboratory calibration.');
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenInspectModal = (app: any) => {
    setSelectedApp(app);
    setIsEditingInspection(false);
    const randSeal = Math.floor(1000 + Math.random() * 9000);
    setSecuritySealNumber(`GATC-SEAL-2026-${randSeal}`);
    setVisualCheckPassed(true);
    setRepeatabilityPassed(true);
    setEccentricityErrorMm('0.01');
    setMaxPermissibleErrorMpe('±0.20');
    setObservedError('0.02');
    setAmbientTemp('23.2°C');
    setAmbientHumidity('54% RH');
    setTestWeightsUsed('NABL Traceable Working Standard Mass Set (Class E2/F1) Serial #GATC-CAL-2026-09');
    setResult('PASSED');
    setOfficerNotes('Laboratory multi-point calibration completed. Instrument conforms to Legal Metrology (General) Rules, 2011 Schedule tolerances.');
    setShowInspectModal(true);
  };

  const handleOpenEditInspect = (app: any) => {
    setSelectedApp(app);
    setIsEditingInspection(true);
    if (app.inspection) {
      setVisualCheckPassed(app.inspection.visualCheckPassed ?? true);
      setRepeatabilityPassed(app.inspection.repeatabilityCheckPassed ?? true);
      setEccentricityErrorMm(String(app.inspection.eccentricityErrorMm ?? '0.01'));
      setMaxPermissibleErrorMpe(String(app.inspection.maxPermissibleErrorMpe ? `±${app.inspection.maxPermissibleErrorMpe}` : '±0.20'));
      setObservedError(String(app.inspection.observedError ?? '0.02'));
      setTestWeightsUsed(app.inspection.testWeightsUsed || 'NABL Traceable Working Standard Mass Set (Class E2/F1) Serial #GATC-CAL-2026-09');
      setSecuritySealNumber(app.inspection.securitySealNumber || `GATC-SEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setResult(app.inspection.result === 'PASS' ? 'PASSED' : 'REJECTED');
      setOfficerNotes(app.inspection.officerNotes || app.rejectionReason || 'Re-calibrated following platform adjustment.');
    } else {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.01');
      setMaxPermissibleErrorMpe('±0.20');
      setObservedError('0.02');
      setTestWeightsUsed('NABL Traceable Working Standard Mass Set (Class E2/F1) Serial #GATC-CAL-2026-09');
      setSecuritySealNumber(`GATC-SEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setResult(app.status === 'REJECTED' ? 'REJECTED' : 'PASSED');
      setOfficerNotes(app.rejectionReason || 'Laboratory re-calibration findings.');
    }
    setShowRejectionModal(false);
    setShowInspectModal(true);
  };

  const handleOpenRejectionMemo = (app: any) => {
    setSelectedApp(app);
    setShowRejectionModal(true);
  };

  const applyCalibrationPreset = (type: 'PERFECT' | 'MARGINAL' | 'REJECT') => {
    if (type === 'PERFECT') {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.00');
      setMaxPermissibleErrorMpe('±0.20');
      setObservedError('0.01');
      setResult('PASSED');
      setOfficerNotes('Exemplary calibration pass. Zero return error null, zero corner load variance.');
    } else if (type === 'MARGINAL') {
      setVisualCheckPassed(true);
      setRepeatabilityPassed(true);
      setEccentricityErrorMm('0.08');
      setMaxPermissibleErrorMpe('±0.20');
      setObservedError('0.16');
      setResult('PASSED');
      setOfficerNotes('Passed within MPE boundary. Recommended re-check in 6 months due to high operational usage.');
    } else {
      setVisualCheckPassed(false);
      setRepeatabilityPassed(false);
      setEccentricityErrorMm('0.45');
      setMaxPermissibleErrorMpe('±0.20');
      setObservedError('0.68');
      setResult('REJECTED');
      setOfficerNotes('REJECTED: Observed error exceeds MPE tolerance (±0.20g). Platform recalibration & load cell servicing required before re-testing.');
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingInspection(true);
    try {
      const isPass = result === 'PASSED' || result === 'PASS';
      const payload = {
        applicationId: selectedApp.id,
        visualCheckPassed,
        repeatabilityCheckPassed: repeatabilityPassed,
        eccentricityErrorMm: parseFloat(eccentricityErrorMm) || 0,
        maxPermissibleErrorMpe: parseFloat(maxPermissibleErrorMpe.replace('±', '')) || 0.20,
        observedError: parseFloat(observedError) || 0.02,
        testWeightsUsed: `${testWeightsUsed} [Conditions: ${ambientTemp}, ${ambientHumidity}]`,
        securitySealNumber,
        result: isPass ? 'PASS' : 'FAIL',
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
      alert(err.response?.data?.message || 'Failed to record/update laboratory calibration.');
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
      alert(`Certificate ${res.data?.data?.certificateNumber} successfully issued and endorsed with RSA-2048 cryptographic seal!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue endorsement certificate.');
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
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-xs font-bold uppercase">
                Government Approved Test Centre (GATC)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Accreditation: {user?.profile?.approvalNumber || 'GATC-DOCA-2024-009'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Calibration & Testing Laboratory Workbench
            </h1>
            <p className="text-xs text-slate-500">
              Approved Centre test records, working standard traceability, and statutory testing endorsements.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Laboratory</span>
            <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Testing Queue</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-2">
              {stats?.assignedPending ?? applications.filter(a => a.status === 'SUBMITTED' || a.status === 'ALLOCATED' || a.status === 'SCHEDULED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Instruments in laboratory queue</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Calibrations Completed</span>
              <TestTube className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700 mt-2">
              {stats?.completedInspections ?? applications.filter(a => a.status === 'INSPECTED' || a.status === 'CERTIFIED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">High-precision laboratory tests</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Certificates Endorsed</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.certificatesIssued ?? applications.filter(a => a.status === 'CERTIFIED').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Asymmetrically signed reports</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Laboratory Accuracy Pass</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              {stats?.passRate ?? 100}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">MPE tolerance conformance</div>
          </div>
        </div>

        {/* Testing Jobs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Centre Workload & Testing Jobs</h3>
              <p className="text-xs text-slate-500">Commercial weighing & measuring instruments submitted for statutory verification</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-900 rounded-lg text-xs font-bold">
              {applications.length} Active Jobs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">App ID</th>
                  <th className="py-3 px-6">Applicant</th>
                  <th className="py-3 px-6">Instrument</th>
                  <th className="py-3 px-6">Schedule / Slot</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Process & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No applications currently allocated to this testing centre.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-blue-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{app.trader?.fullName}</div>
                        <div className="text-[11px] text-slate-400">{app.trader?.phone || app.trader?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                        <div className="text-[11px] text-slate-500">
                          {app.instrument?.category} ({app.instrument?.accuracyClass})
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {app.scheduledDate ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {new Date(app.scheduledDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-[11px] text-blue-600 font-semibold">
                              {new Date(app.scheduledDate).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3 h-3" /> Queue Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1 ${
                            app.status === 'CERTIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'INSPECTED' || app.status === 'INSPECTION_COMPLETED'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {app.status}
                        </span>
                        {app.status === 'REJECTED' && app.rejectionReason && (
                          <div className="text-[10px] text-rose-700 font-medium truncate max-w-xs mt-1" title={app.rejectionReason}>
                            {app.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {/* Status-Driven Processing Workflow */}
                        {app.status === 'SUBMITTED' || app.status === 'ALLOCATED' ? (
                          <button
                            onClick={() => handleOpenScheduleModal(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Calibration</span>
                          </button>
                        ) : app.status === 'SCHEDULED' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenInspectModal(app)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              <TestTube className="w-3.5 h-3.5" />
                              <span>Record Lab Test</span>
                            </button>
                            <button
                              onClick={() => handleOpenScheduleModal(app)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Reschedule Test Bench"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : app.status === 'INSPECTED' || app.status === 'INSPECTION_COMPLETED' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleIssueCertificate(app.id)}
                              disabled={issuingCertId === app.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{issuingCertId === app.id ? 'Endorsing...' : 'Endorse Certificate'}</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditInspect(app)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Observations"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : app.status === 'REJECTED' ? (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenRejectionMemo(app)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-bold text-xs transition cursor-pointer"
                              title="View Statutory Rejection Notice (Form VIII)"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Rejection Notice</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditInspect(app)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-bold text-xs transition cursor-pointer"
                              title="Re-Calibrate instrument or amend findings"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Edit / Re-Calibrate</span>
                            </button>
                          </div>
                        ) : app.status === 'CERTIFIED' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {app.certificate && (
                              <a
                                href={`/verify/${app.certificate.certificateNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>QR Seal</span>
                              </a>
                            )}
                            {app.certificate?.id && (
                              <a
                                href={certificateApi.downloadPdfUrl(app.certificate.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition"
                                title="Download Calibration Certificate PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenEditInspect(app)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Edit / Amend Calibration Records"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. Laboratory Calibration Scheduler Modal */}
      {showScheduleModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Laboratory Calibration</h3>
                <p className="text-xs text-slate-500">Assign test bench and working standards batch slot</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-800">{selectedApp.trader?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrument Serial:</span>
                <span className="font-mono font-bold text-blue-900">{selectedApp.instrument?.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category & Accuracy:</span>
                <span className="font-bold text-slate-700">
                  {selectedApp.instrument?.category} ({selectedApp.instrument?.accuracyClass})
                </span>
              </div>
              {selectedApp.remarks && (
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <span className="block text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                    Trader Notes & Preferred Time:
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium mt-1">
                    {selectedApp.remarks}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-medium">
              <AppointmentScheduler
                value={scheduleDate}
                onChange={(val) => setScheduleDate(val)}
                label="Confirmed Calibration Bench Window"
                description="Official laboratory testing slot allocated for this instrument."
              />

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Laboratory Instructions & Calibration Notice
                </label>
                <textarea
                  rows={2}
                  value={scheduleRemarks}
                  onChange={(e) => setScheduleRemarks(e.target.value)}
                  placeholder="e.g. Standard weights set E2/F1 prepared. Please deliver instrument with power adapter."
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  {scheduling ? 'Allocating Bench...' : 'Confirm Schedule & Assign Bench'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Laboratory Calibration Record / Edit Modal */}
      {showInspectModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditingInspection ? 'Edit / Re-Calibrate Observations' : 'Record Laboratory Calibration Observations'}
                  </h3>
                  {isEditingInspection && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Edit Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Legal Metrology (General) Rules, 2011 Schedule Verification & Test Endorsement</p>
              </div>
              <button onClick={() => setShowInspectModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center justify-between p-2.5 mb-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
              <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Test Preset:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => applyCalibrationPreset('PERFECT')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ✓ Conforming (Ideal)
                </button>
                <button
                  type="button"
                  onClick={() => applyCalibrationPreset('MARGINAL')}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ⚠️ Marginal Pass
                </button>
                <button
                  type="button"
                  onClick={() => applyCalibrationPreset('REJECT')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  ✕ Exceeds MPE
                </button>
              </div>
            </div>

            <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs font-medium">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">App: </span>
                  <span className="font-mono font-bold text-slate-900">{selectedApp.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Instrument: </span>
                  <span className="font-bold text-slate-900">{selectedApp.instrument?.serialNumber}</span>
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={visualCheckPassed}
                    onChange={(e) => setVisualCheckPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-900"
                  />
                  <span>Visual & Physical Check Passed (Markings intact)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={repeatabilityPassed}
                    onChange={(e) => setRepeatabilityPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-900"
                  />
                  <span>Repeatability & Zero-Load Return Nominal</span>
                </label>
              </div>

              {/* Errors & Tolerances */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">MPE Tolerance</label>
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
                  <label className="block text-slate-700 font-bold mb-1">Observed Error</label>
                  <input
                    type="text"
                    required
                    value={observedError}
                    onChange={(e) => setObservedError(e.target.value)}
                    placeholder="0.02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Eccentricity (mm/g)</label>
                  <input
                    type="text"
                    value={eccentricityErrorMm}
                    onChange={(e) => setEccentricityErrorMm(e.target.value)}
                    placeholder="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Standards and Environmental */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ambient Temperature</label>
                  <input
                    type="text"
                    value={ambientTemp}
                    onChange={(e) => setAmbientTemp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Relative Humidity</label>
                  <input
                    type="text"
                    value={ambientHumidity}
                    onChange={(e) => setAmbientHumidity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Laboratory Working Standards Traceability</label>
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
                  <label className="block text-slate-700 font-bold mb-1">Physical Security Seal Mark #</label>
                  <input
                    type="text"
                    required
                    value={securitySealNumber}
                    onChange={(e) => setSecuritySealNumber(e.target.value)}
                    placeholder="e.g. GATC-SEAL-2026-9041"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Calibration Decision</label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold"
                  >
                    <option value="PASSED">PASSED (Within Legal Tolerance)</option>
                    <option value="REJECTED">REJECTED (Exceeds MPE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Signatory Calibration Notes</label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className={`px-5 py-2 rounded-xl font-bold text-white transition shadow-sm cursor-pointer ${
                    result === 'PASSED' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingInspection
                    ? 'Saving...'
                    : isEditingInspection
                    ? 'Save & Update Observations'
                    : 'Record Test & Sign Observations'}
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
                    <h3 className="text-lg font-black text-slate-900">GATC Laboratory Rejection Notice</h3>
                  </div>
                </div>
                <button onClick={() => setShowRejectionModal(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official laboratory notice of calibration rejection and out-of-tolerance non-conformance
              </p>
            </div>

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
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Testing Laboratory</span>
                <span className="text-slate-700 truncate block">{user?.fullName}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs space-y-2 mb-4">
              <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Reason for Rejection:
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-rose-950 font-semibold font-mono text-xs">
                {selectedApp.rejectionReason || selectedApp.inspection?.officerNotes || 'Observed error exceeded Maximum Permissible Error (MPE) limit.'}
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

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1 mb-5">
              <span className="font-extrabold block">⚖️ Legal Metrology Rectification Directive:</span>
              <p>
                Instrument fails Schedule tolerance limits. The applicant must have the load cells and platform serviced by an authorized repairer prior to re-testing.
              </p>
            </div>

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
                  onClick={() => handleOpenEditInspect(selectedApp)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Re-Calibrate / Edit Findings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
