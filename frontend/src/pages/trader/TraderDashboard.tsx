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
  X,
  Camera,
  Upload,
  Calendar,
  UserCheck,
  Bell,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Check,
  History,
  Info,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { instrumentApi, applicationApi, analyticsApi, certificateApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AppointmentScheduler } from '../../components/AppointmentScheduler';

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
  const [showLifecycleModal, setShowLifecycleModal] = useState<boolean>(false);
  const [selectedLifecycleInst, setSelectedLifecycleInst] = useState<any | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [selectedRejectedApp, setSelectedRejectedApp] = useState<any | null>(null);
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);

  // Add Instrument Form State
  const [newSerial, setNewSerial] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('NAWI_ELECTRONIC');
  const [newMake, setNewMake] = useState<string>('');
  const [newApprovalNo, setNewApprovalNo] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<string>('');
  const [newAccuracyClass, setNewAccuracyClass] = useState<string>('CLASS_III');
  const [newUsage, setNewUsage] = useState<string>('HIGH');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newPhotoUrls, setNewPhotoUrls] = useState<string[]>([]);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [submittingInst, setSubmittingInst] = useState<boolean>(false);

  // Apply Verification Form State
  const [applyType, setApplyType] = useState<string>('PERIODIC_REVERIFICATION');
  const [applyTargetType, setApplyTargetType] = useState<string>('LMO');
  const [applyPreferredDate, setApplyPreferredDate] = useState<string>('');
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      fileList.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setNewPhotoUrls((prev) => {
              if (prev.length >= 6) return prev;
              return [...prev, reader.result as string];
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // reset input so same file can be re-selected if removed
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setNewPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: 'SCALE' | 'DISPENSER' | 'WEIGHBRIDGE') => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    if (preset === 'SCALE') {
      setNewSerial(`ESS-2026-PY-${rand}`);
      setNewCategory('NAWI_ELECTRONIC');
      setNewMake('Essae DS-215 Trade Pro');
      setNewApprovalNo('IND/09/2023/881');
      setNewCapacity('30 kg (e=5g)');
      setNewAccuracyClass('CLASS_III');
      setNewUsage('HIGH');
      setNewPhotoUrls([
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
      ]);
    } else if (preset === 'DISPENSER') {
      setNewSerial(`MID-2026-PY-${rand}`);
      setNewCategory('FUEL_DISPENSER');
      setNewMake('Midco Ultra Multi-Product Dispenser');
      setNewApprovalNo('IND/04/2022/412');
      setNewCapacity('50 L/min (±0.3%)');
      setNewAccuracyClass('CLASS_II');
      setNewUsage('HIGH');
      setNewPhotoUrls([
        'https://images.unsplash.com/photo-1527018607616-a656a38147ea?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80'
      ]);
    } else {
      setNewSerial(`AVY-2026-PY-${rand}`);
      setNewCategory('WEIGHBRIDGE');
      setNewMake('Avery India Heavy Axle Weighbridge');
      setNewApprovalNo('IND/11/2021/729');
      setNewCapacity('60,000 kg (e=10kg)');
      setNewAccuracyClass('CLASS_IIII');
      setNewUsage('INDUSTRIAL_HEAVY');
      setNewPhotoUrls([
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80'
      ]);
    }
  };

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
        installationAddress: newAddress || `${user?.district || 'Puducherry'}, ${user?.state || 'Puducherry'}`
      });

      if (newPhotoUrls.length > 0) {
        try {
          localStorage.setItem(`inst_photos_${newSerial}`, JSON.stringify(newPhotoUrls));
          localStorage.setItem(`inst_photo_${newSerial}`, newPhotoUrls[0]);
        } catch (storageErr) {
          console.warn('LocalStorage image quota exceeded, skipping thumbnail cache');
        }
      }

      setShowAddInstrumentModal(false);
      // Reset form
      setNewSerial('');
      setNewMake('');
      setNewApprovalNo('');
      setNewCapacity('');
      setNewPhotoUrls([]);
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
        preferredDate: applyPreferredDate || undefined,
        remarks: applyRemarks
      });
      setShowApplyModal(false);
      setApplyRemarks('');
      setApplyPreferredDate('');
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

        {/* Real-time Notifications & Departmental Dispatch Banner */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Statutory Notice: {notifications[0].title}
                </div>
                <p className="text-xs text-slate-100 font-medium mt-0.5">
                  {notifications[0].message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 whitespace-nowrap"
            >
              {showNotifDrawer ? 'Hide Logs' : `View All Notices (${notifications.length})`}
            </button>
          </div>
        )}

        {/* Expanded Notifications Drawer */}
        {showNotifDrawer && notifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Departmental Notices & SMS Dispatch History
              </h3>
              <span className="text-[11px] text-slate-400">Total: {notifications.length} alerts</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3 transition">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    <div className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Commercial Instruments</h3>
              <p className="text-xs text-slate-500">Every physical measuring unit with unique ScaleCheck ID & lifecycle tracking</p>
            </div>
            <button
              onClick={() => setShowAddInstrumentModal(true)}
              className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register New Scale / Dispenser</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Instrument Identity</th>
                  <th className="py-3 px-6">Category / Class</th>
                  <th className="py-3 px-6">Capacity</th>
                  <th className="py-3 px-6">Validity Expiry</th>
                  <th className="py-3 px-6">Predictive Wear Advisory</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instruments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Scale className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-sm text-slate-700">No Instruments Registered Yet</p>
                      <p className="text-xs text-slate-500 mt-1">Click the "Register Instrument" button above to add your first scale or meter.</p>
                      <button
                        onClick={() => setShowAddInstrumentModal(true)}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition"
                      >
                        + Register First Instrument
                      </button>
                    </td>
                  </tr>
                ) : (
                  instruments.map((inst) => {
                    let photos: string[] = [];
                    try {
                      const raw = localStorage.getItem(`inst_photos_${inst.serialNumber}`);
                      if (raw) photos = JSON.parse(raw);
                      else {
                        const single = localStorage.getItem(`inst_photo_${inst.serialNumber}`);
                        if (single) photos = [single];
                      }
                    } catch (e) {
                      const single = localStorage.getItem(`inst_photo_${inst.serialNumber}`);
                      if (single) photos = [single];
                    }

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {photos.length > 0 ? (
                              <div
                                className="relative cursor-pointer group"
                                onClick={() => setActiveLightboxImg(photos[0])}
                                title={`Click to view ${photos.length} evidence photo(s)`}
                              >
                                <img
                                  src={photos[0]}
                                  alt="Scale"
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition"
                                />
                                {photos.length > 1 && (
                                  <span className="absolute -bottom-1 -right-1 bg-blue-900 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                                    +{photos.length - 1}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0">
                                <Scale className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-slate-900 font-mono text-sm">
                                {inst.serialNumber}
                              </div>
                              <div className="text-slate-600 text-[11px] font-medium">{inst.makeAndModel}</div>
                              <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                                SC-INST-PY-2026-{inst.id.slice(-5).toUpperCase()}
                              </div>
                            </div>
                          </div>
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
                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedInstId(inst.id);
                              setShowApplyModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold transition text-[11px] shadow-xs"
                          >
                            Apply Verification
                          </button>

                          <button
                            onClick={() => {
                              setSelectedLifecycleInst(inst);
                              setShowLifecycleModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition text-[11px] inline-flex items-center gap-1"
                            title="View Complete Instrument Lifecycle"
                          >
                            <History className="w-3.5 h-3.5 text-blue-800" />
                            <span>Lifecycle</span>
                          </button>

                          {inst.certificates && inst.certificates[0] && (
                            <a
                              href={certificateApi.downloadPdfUrl(inst.certificates[0].certificateNumber)}
                              target="_blank"
                              rel="noreferrer"
                              title="Download Signed PDF Certificate"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 transition text-[11px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* In-Flight Applications & Statutory Lifecycle Stepper Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Verification Applications & Statutory Progress Timeline</h3>
            <p className="text-xs text-slate-500">Live 5-stage tracking from Submission ➔ Officer Allocation ➔ Scheduling ➔ Stamping</p>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Verification Applications In-Flight</p>
                <p className="text-xs text-slate-500 mt-1">Select any registered instrument above and click "Apply Verification" to begin statutory stamping.</p>
              </div>
            ) : (
              applications.map((app) => {
                // Determine stage number (1-5)
                let stage = 1;
                if (app.status === 'ALLOCATED') stage = 2;
                else if (app.status === 'SCHEDULED') stage = 3;
                else if (app.status === 'INSPECTION_COMPLETED') stage = 4;
                else if (app.status === 'CERTIFIED') stage = 5;

                return (
                  <div key={app.id} className="p-6 hover:bg-slate-50/50 transition space-y-4">
                    {/* Header info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-blue-900 text-sm">
                            {app.applicationNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {app.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            Instrument: <strong className="text-slate-800">{app.instrument?.serialNumber}</strong> ({app.instrument?.makeAndModel})
                          </span>
                        </div>
                        {app.remarks && (
                          <div className="text-[11px] text-slate-500 mt-1 italic">
                            Notes / Request: {app.remarks}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {app.certificate ? (
                          <a
                            href={`/verify/${app.certificate.certificateNumber}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Verify QR Certificate</span>
                          </a>
                        ) : (
                          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                            Fee Paid: <strong className="text-slate-900">₹{app.feeAmount}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 5-Stage Statutory Stepper */}
                    <div className="grid grid-cols-5 gap-2 pt-2 text-center text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          stage >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] mt-1.5">1. Submitted</div>
                        <div className="text-[10px] text-slate-400 font-mono">Fee Paid</div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          stage >= 2 ? 'bg-emerald-600 text-white' : stage === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {stage >= 2 ? <Check className="w-4 h-4" /> : '2'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] mt-1.5">2. Allocation</div>
                        <div className="text-[10px] text-slate-500">
                          {app.allocatedTo ? app.allocatedTo.fullName : 'District LMO'}
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          stage >= 3 ? 'bg-emerald-600 text-white' : stage === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {stage >= 3 ? <Check className="w-4 h-4" /> : '3'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] mt-1.5">3. Scheduled</div>
                        <div className="text-[10px] text-amber-700 font-semibold">
                          {app.scheduledDate
                            ? new Date(app.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                            : 'Pending Slot'}
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          stage >= 4 ? 'bg-emerald-600 text-white' : stage === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {stage >= 4 ? <Check className="w-4 h-4" /> : '4'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] mt-1.5">4. Inspected</div>
                        <div className="text-[10px] text-slate-500">
                          {app.inspection ? `Seal: ${app.inspection.securitySealNumber}` : 'Standard Weights'}
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          stage >= 5 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {stage >= 5 ? <Award className="w-4 h-4" /> : '5'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] mt-1.5">5. Certified</div>
                        <div className="text-[10px] text-slate-500">
                          {app.certificate ? 'Live QR Stamped' : 'Statutory RSA'}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Callout Box if Scheduled */}
                    {app.scheduledDate && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
                          <span className="text-amber-950">
                            <strong>Confirmed On-Site Inspection:</strong>{' '}
                            {new Date(app.scheduledDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}{' '}
                            at {new Date(app.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {app.allocatedTo && (
                          <span className="text-[11px] text-amber-900 font-medium">
                            Officer: <strong>{app.allocatedTo.fullName}</strong> ({app.allocatedTo.role})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejection Notice Callout Box if Rejected */}
                    {app.status === 'REJECTED' && (
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-rose-900 block text-sm">
                              Statutory Verification Non-Conformance (Form VIII Notice)
                            </span>
                            <p className="text-rose-800 text-[11px] mt-0.5 font-medium">
                              {app.rejectionReason || app.inspection?.officerNotes || 'Observed error exceeded Maximum Permissible Error (MPE) limit.'}
                            </p>
                            <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                              ⚖️ Under Section 24, Legal Metrology Act, 2009: 7-day cure period to adjust instrument with licensed repairer.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRejectedApp(app);
                            setShowRejectionModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs transition cursor-pointer"
                        >
                          View Form VIII Notice
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Register Instrument */}
      {showAddInstrumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Register New Commercial Instrument</h3>
                <p className="text-xs text-slate-500">Add physical measuring instrument to the central Legal Metrology registry</p>
              </div>
              <button onClick={() => setShowAddInstrumentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets for Demo */}
            <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                ⚡ Quick Pre-Fill Realistic Test Instruments:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('SCALE')}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs transition"
                >
                  ⚖️ Retail Electronic Scale (30 kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('DISPENSER')}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition"
                >
                  ⛽ Fuel Dispenser Nozzle
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('WEIGHBRIDGE')}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition"
                >
                  🚛 Motor Weighbridge (60T)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateInstrument} className="space-y-4 text-xs font-medium">
              {/* Multiple Photo Evidence Upload Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-bold">
                    Instrument & Stamping Evidence Photos ({newPhotoUrls.length}/6)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Nameplate, scale display, seal tag & shop location
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  {newPhotoUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 bg-white aspect-square shadow-2xs transition">
                      <img
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setActiveLightboxImg(url)}
                        title="Click to zoom preview"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xs transition"
                        title="Remove this photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {newPhotoUrls.length < 6 && (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/60 rounded-xl cursor-pointer aspect-square transition p-2 text-center group">
                      <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition mb-0.5" />
                      <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-800 leading-tight">
                        {newPhotoUrls.length === 0 ? 'Upload Photos' : '+ Add Photo'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium">Multi-select</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
                  <span>💡 Tip: You can select multiple images at once or click + Add Photo to upload sequentially.</span>
                  {newPhotoUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrls([])}
                      className="text-red-600 hover:underline font-bold"
                    >
                      Clear All Photos
                    </button>
                  )}
                </div>
              </div>

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
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition shadow-sm"
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
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Verification & Schedule Inspection</h3>
                <p className="text-xs text-slate-500">Propose preferred inspection time slot to the jurisdictional officer</p>
              </div>
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold"
                >
                  {instruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.serialNumber} — {inst.makeAndModel} ({inst.capacity})
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

              {/* Preferred Inspection Date & Time Picker */}
              <AppointmentScheduler
                value={applyPreferredDate}
                onChange={(val) => setApplyPreferredDate(val)}
                label="Preferred Inspection Date & Time Slot"
                description="Select your preferred statutory inspection window for the Legal Metrology Officer."
              />

              <div>
                <label className="block text-slate-700 font-bold mb-1">Premises Access Notes / Special Instructions</label>
                <textarea
                  rows={2}
                  value={applyRemarks}
                  onChange={(e) => setApplyRemarks(e.target.value)}
                  placeholder="e.g. Morning stall hours, working standards parking available at rear entrance."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Fee breakdown note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs">
                <div className="font-bold flex items-center justify-between">
                  <span>Statutory Verification Fee:</span>
                  <span className="text-sm font-extrabold text-blue-900">₹ 500 – ₹ 1,200 (Auto-calculated)</span>
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
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition shadow-sm"
                >
                  {submittingApp ? 'Submitting Application...' : 'Confirm & Request Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Instrument Lifecycle Audit */}
      {showLifecycleModal && selectedLifecycleInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                  Central Metrology Registry — Audit Ledger
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Instrument Lifecycle Dossier
                </h3>
              </div>
              <button onClick={() => setShowLifecycleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instrument Identity Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">ScaleCheck ID:</span>
                <span className="font-mono font-bold text-blue-900">
                  SC-INST-PY-2026-{selectedLifecycleInst.id.slice(-5).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Permanent Serial No:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLifecycleInst.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Make & Model:</span>
                <span className="font-bold text-slate-800">{selectedLifecycleInst.makeAndModel}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Model Approval No:</span>
                <span className="font-mono text-slate-800">{selectedLifecycleInst.modelApprovalNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Accuracy Class:</span>
                <span className="font-bold text-blue-800">{selectedLifecycleInst.accuracyClass}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Capacity:</span>
                <span className="font-bold text-slate-800">{selectedLifecycleInst.capacity}</span>
              </div>
            </div>

            {/* Attached Photo Evidence Gallery in Dossier */}
            {(() => {
              let dossierPhotos: string[] = [];
              try {
                const raw = localStorage.getItem(`inst_photos_${selectedLifecycleInst.serialNumber}`);
                if (raw) dossierPhotos = JSON.parse(raw);
                else {
                  const s = localStorage.getItem(`inst_photo_${selectedLifecycleInst.serialNumber}`);
                  if (s) dossierPhotos = [s];
                }
              } catch (e) {
                const s = localStorage.getItem(`inst_photo_${selectedLifecycleInst.serialNumber}`);
                if (s) dossierPhotos = [s];
              }

              if (dossierPhotos.length === 0) return null;

              return (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
                    Attached Statutory Evidence Photos ({dossierPhotos.length}):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {dossierPhotos.map((url, i) => (
                      <div key={i} className="relative shrink-0 cursor-pointer group" onClick={() => setActiveLightboxImg(url)}>
                        <img
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-300 group-hover:scale-105 transition"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Lifecycle Stages */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Chronological Statutory Lifecycle Records:
              </h4>

              {/* Event 1: Registration */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">1. Permanent Commercial Registration</div>
                  <p className="text-slate-600 mt-0.5">
                    Registered by {user?.fullName} at {selectedLifecycleInst.installationAddress}.
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Timestamp: {new Date(selectedLifecycleInst.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Event 2: Verification Applications */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">2. Statutory Verification Applications</div>
                  <p className="text-slate-600 mt-0.5">
                    Status: <strong className="text-blue-900">{selectedLifecycleInst.status}</strong>. Fee schedule automatically computed under Legal Metrology Rules.
                  </p>
                </div>
              </div>

              {/* Event 3: Tamper-Proof Cryptographic Certification */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">3. Tamper-Proof Verification & RSA-2048 Stamping</div>
                  <p className="text-slate-600 mt-0.5">
                    Field tests verified using calibrated working standards. Stamped certificates cryptographically signed and verifiable by citizen QR scan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLifecycleModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for High-Resolution Photo Evidence Inspection */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-4 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Camera className="w-4 h-4 text-blue-800" />
                <span>Statutory Physical Instrument & Stamping Plate Photo Evidence</span>
              </div>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden max-h-[70vh]">
              <img
                src={activeLightboxImg}
                alt="Evidence Full View"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
      {/* Trader Rejection Notice Modal (FORM VIII) */}
      {showRejectionModal && selectedRejectedApp && (
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

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Application Reference</span>
                <span className="font-mono font-bold text-blue-900">{selectedRejectedApp.applicationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Instrument Serial</span>
                <span className="font-mono font-bold text-slate-900">{selectedRejectedApp.instrument?.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Trader / Firm</span>
                <span className="font-bold text-slate-900">{selectedRejectedApp.trader?.fullName || user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Premises Location</span>
                <span className="text-slate-700 truncate block">{selectedRejectedApp.instrument?.installationAddress}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs space-y-2 mb-4">
              <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Reason for Rejection:
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-rose-950 font-semibold font-mono text-xs">
                {selectedRejectedApp.rejectionReason || selectedRejectedApp.inspection?.officerNotes || 'Observed error exceeded Maximum Permissible Error (MPE) limit.'}
              </div>

              {selectedRejectedApp.inspection && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Observed Error:</span>
                    <span className="font-bold text-rose-700 font-mono">+{selectedRejectedApp.inspection.observedError}g</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MPE Limit:</span>
                    <span className="font-bold text-slate-700 font-mono">±{selectedRejectedApp.inspection.maxPermissibleErrorMpe}g</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Seal Recorded:</span>
                    <span className="font-mono text-slate-700">{selectedRejectedApp.inspection.securitySealNumber || 'WITHHELD'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1 mb-5">
              <span className="font-extrabold block">⚖️ Legal Metrology Rectification Directive:</span>
              <p>
                Under Section 24 of the Legal Metrology Act, 2009, this measuring instrument is strictly barred from commercial use.
                You are granted a <strong>7-day statutory rectification window</strong> to have the scale serviced by an authorized repairer and apply for re-verification.
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
              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
