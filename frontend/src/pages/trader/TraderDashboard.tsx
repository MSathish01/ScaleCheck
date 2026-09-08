import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  PlusCircle,
  FileText,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  QrCode,
  TrendingUp,
  ShieldCheck,
  Percent,
  X
} from 'lucide-react';
import { instrumentApi, applicationApi, analyticsApi, certificateApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TraderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showAddInstrumentModal, setShowAddInstrumentModal] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [selectedInstId, setSelectedInstId] = useState<string>('');

  // Add Instrument Form State
  const [newSerial, setNewSerial] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('NAWI_ELECTRONIC');
  const [newMake, setNewMake] = useState<string>('');
  const [newApprovalNo, setNewApprovalNo] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<string>('');
  const [newAccuracyClass, setNewAccuracyClass] = useState<string>('CLASS_III');
  const [newUsage, setNewUsage] = useState<string>('HIGH');
  const [newAddress, setNewAddress] = useState<string>('');
  const [submittingInst, setSubmittingInst] = useState<boolean>(false);

  // Apply Verification Form State
  const [applyType, setApplyType] = useState<string>('PERIODIC_REVERIFICATION');
  const [applyTargetType, setApplyTargetType] = useState<string>('LMO');
  const [applyRemarks, setApplyRemarks] = useState<string>('');
  const [submittingApp, setSubmittingApp] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, instRes, appRes, notifRes] = await Promise.all([
        analyticsApi.getDashboard(),
        instrumentApi.getMy(),
        applicationApi.getMy(),
        analyticsApi.getNotifications()
      ]);
      setStats(statsRes.data?.data);
      setInstruments(instRes.data?.data || []);
      setApplications(appRes.data?.data || []);
      setNotifications(notifRes.data?.data || []);
    } catch (err) {
      console.error('Error loading trader dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInst(true);
    try {
      await instrumentApi.create({
        serialNumber: newSerial,
        category: newCategory,
        makeAndModel: newMake,
        modelApprovalNumber: newApprovalNo,
        capacity: newCapacity,
        accuracyClass: newAccuracyClass,
        usageIntensity: newUsage,
        installationAddress: newAddress || `${user?.district}, ${user?.state}`
      });
      setShowAddInstrumentModal(false);
      // Reset form
      setNewSerial('');
      setNewMake('');
      setNewApprovalNo('');
      setNewCapacity('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register instrument.');
    } finally {
      setSubmittingInst(false);
    }
  };

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstId) return;
    setSubmittingApp(true);
    try {
      await applicationApi.submit({
        instrumentId: selectedInstId,
        type: applyType,
        preferredTargetType: applyTargetType,
        remarks: applyRemarks
      });
      setShowApplyModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase">
                Trader Workbench
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {user?.profile?.organizationName || user?.fullName}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Commercial Instruments & Verification Portal
            </h1>
            <p className="text-xs text-slate-500">
              Manage statutory compliance, track re-verification timelines, and view tamper-proof certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddInstrumentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Instrument</span>
            </button>
          </div>
        </div>

        {/* Early Renewal Gamified Incentive Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-100">
                {t('incentive.banner')}
              </div>
              <p className="text-sm font-bold mt-0.5">
                Renew your verification certificate &gt;30 days before statutory expiry to receive a 10% fee reduction credit and priority inspection slot!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white text-amber-900 text-xs font-extrabold shadow-sm">
            Active Incentive Policy
          </span>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Scales / Units</span>
              <Scale className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats?.totalInstruments || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered in DoCA database</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Verified & Stamped</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.verifiedInstruments || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Legally compliant for trade</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>In-Flight Applications</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {stats?.pendingApplications || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pending inspection / allocation</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Expiring Soon</span>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-600 mt-2">
              {stats?.expiringSoon || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Within next 30 days</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Compliance Score</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700 mt-2">
              {stats?.complianceScore ?? 100}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Premises legal standing</div>
          </div>
        </div>

        {/* Instruments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Instruments & Stamping Status</h3>
              <p className="text-xs text-slate-500">Live wear scoring and statutory validity monitoring</p>
            </div>
            <button
              onClick={() => setShowAddInstrumentModal(true)}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              + Register Another
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Serial No & Model</th>
                  <th className="py-3 px-6">Category / Class</th>
                  <th className="py-3 px-6">Capacity</th>
                  <th className="py-3 px-6">Validity Expiry</th>
                  <th className="py-3 px-6">Predictive Wear Advisory</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 font-mono text-sm">
                        {inst.serialNumber}
                      </div>
                      <div className="text-slate-500 text-[11px]">{inst.makeAndModel}</div>
                      <div className="text-[10px] text-slate-400">Approval: {inst.modelApprovalNumber}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{inst.category}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                        {inst.accuracyClass}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      {inst.capacity}
                    </td>

                    <td className="py-4 px-6">
                      {inst.validityExpiryAt ? (
                        <div>
                          <div className="font-bold text-slate-900">
                            {new Date(inst.validityExpiryAt).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Status: <span className="text-emerald-700 font-semibold">{inst.status}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          UNVERIFIED
                        </span>
                      )}
                    </td>

                    {/* Predictive Wear & Advisory */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                inst.wearRiskScore >= 0.75
                                  ? 'bg-red-600'
                                  : inst.wearRiskScore >= 0.5
                                  ? 'bg-orange-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.round(inst.wearRiskScore * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {Math.round(inst.wearRiskScore * 100)}% Wear
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {inst.predictiveAdvisory || 'Normal operation within legal error tolerance.'}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInstId(inst.id);
                          setShowApplyModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold border border-blue-200 transition text-[11px]"
                      >
                        Apply Re-verification
                      </button>

                      {inst.certificates && inst.certificates[0] && (
                        <a
                          href={certificateApi.downloadPdfUrl(inst.certificates[0].certificateNumber)}
                          target="_blank"
                          rel="noreferrer"
                          title="Download Signed PDF Certificate"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-700" />
                          <span>PDF</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* In-Flight Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Verification Applications & Job Tracking</h3>
            <p className="text-xs text-slate-500">Scheduled inspections and certificate issuance timeline</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Application ID</th>
                  <th className="py-3 px-6">Instrument</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Allocated Officer</th>
                  <th className="py-3 px-6">Scheduled Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-extrabold font-mono text-blue-900 text-sm">
                      {app.applicationNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                      <div className="text-[11px] text-slate-500">{app.instrument?.makeAndModel}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {app.type}
                    </td>
                    <td className="py-4 px-6">
                      {app.allocatedTo ? (
                        <div>
                          <div className="font-bold text-slate-900">{app.allocatedTo.fullName}</div>
                          <div className="text-[10px] text-blue-700">{app.allocatedTo.role}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending Allocation</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {app.scheduledDate
                        ? new Date(app.scheduledDate).toLocaleString('en-IN')
                        : 'Awaiting Schedule'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wide ${
                          app.status === 'CERTIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : app.status === 'INSPECTION_COMPLETED'
                            ? 'bg-teal-100 text-teal-800'
                            : app.status === 'SCHEDULED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {app.certificate ? (
                        <a
                          href={`/verify/${app.certificate.certificateNumber}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Verify QR</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Register Instrument */}
      {showAddInstrumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Register New Commercial Instrument</h3>
              <button onClick={() => setShowAddInstrumentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstrument} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Serial Number (Permanent Mark)</label>
                  <input
                    type="text"
                    required
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="e.g. EPS-2026-PY-1082"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="NAWI_ELECTRONIC">Electronic Scale (NAWI)</option>
                    <option value="NAWI_MECHANICAL">Mechanical Counter Scale</option>
                    <option value="FUEL_DISPENSER">Fuel Dispenser (Petrol/Diesel)</option>
                    <option value="WEIGHBRIDGE">Heavy Motor Weighbridge</option>
                    <option value="STORAGE_TANK">Petroleum Storage Tank</option>
                    <option value="FLOW_METER">Industrial Flow Meter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Make & Model</label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="e.g. Essae DS-215"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Model Approval Cert No.</label>
                  <input
                    type="text"
                    required
                    value={newApprovalNo}
                    onChange={(e) => setNewApprovalNo(e.target.value)}
                    placeholder="e.g. IND/09/2022/411"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Capacity</label>
                  <input
                    type="text"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder="e.g. 50 kg (e=10g)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Accuracy Class</label>
                  <select
                    value={newAccuracyClass}
                    onChange={(e) => setNewAccuracyClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="CLASS_I">Class I (Special / Gold)</option>
                    <option value="CLASS_II">Class II (High Precision)</option>
                    <option value="CLASS_III">Class III (Medium / Trade)</option>
                    <option value="CLASS_IIII">Class IIII (Ordinary)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Daily Load Intensity</label>
                  <select
                    value={newUsage}
                    onChange={(e) => setNewUsage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="LOW">Low (Jewelry/Lab)</option>
                    <option value="MEDIUM">Medium (Retail Grocery)</option>
                    <option value="HIGH">High (Mandi / Wholesale)</option>
                    <option value="INDUSTRIAL_HEAVY">Heavy Industrial / Quarry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Installation Premises Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Market Stall No., Street, Pincode"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddInstrumentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInst}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition"
                >
                  {submittingInst ? 'Registering...' : 'Register Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply for Verification */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Apply for Verification / Re-verification</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyVerification} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Instrument</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  {instruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.serialNumber} — {inst.makeAndModel} ({inst.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Verification Type</label>
                  <select
                    value={applyType}
                    onChange={(e) => setApplyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="PERIODIC_REVERIFICATION">Periodic Statutory Reverification</option>
                    <option value="INITIAL_VERIFICATION">Initial Stamping (New Unit)</option>
                    <option value="POST_REPAIR_VERIFICATION">Post-Repair Stamping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Verification Body</label>
                  <select
                    value={applyTargetType}
                    onChange={(e) => setApplyTargetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="LMO">Legal Metrology Officer (State Department)</option>
                    <option value="GATC">Govt Approved Test Centre (GATC Lab)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Special Notes / Accessibility</label>
                <textarea
                  rows={2}
                  value={applyRemarks}
                  onChange={(e) => setApplyRemarks(e.target.value)}
                  placeholder="e.g. Available weekdays 9 AM - 1 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Fee breakdown note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs">
                <div className="font-bold flex items-center justify-between">
                  <span>Statutory Verification Fee:</span>
                  <span className="text-sm font-extrabold">₹ 500 – ₹ 1,200 (Auto-calculated)</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  10% early-renewal incentive discount automatically applied if submitted &gt;30 days before validity expiration.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition"
                >
                  {submittingApp ? 'Submitting Application...' : 'Confirm & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
