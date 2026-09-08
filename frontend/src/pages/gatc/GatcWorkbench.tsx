import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TestTube, CheckCircle2, Clock, Award, QrCode, Download, ShieldCheck } from 'lucide-react';
import { applicationApi, certificateApi, analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const GatcWorkbench: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
              {stats?.assignedPending || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Instruments in laboratory queue</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Calibrations Completed</span>
              <TestTube className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700 mt-2">
              {stats?.completedInspections || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">High-precision laboratory tests</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Certificates Endorsed</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.certificatesIssued || 0}
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
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Centre Workload & Testing Jobs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">App ID</th>
                  <th className="py-3 px-6">Applicant</th>
                  <th className="py-3 px-6">Instrument</th>
                  <th className="py-3 px-6">Schedule</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-blue-900">{app.applicationNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{app.trader?.fullName}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                      <div className="text-[11px] text-slate-500">{app.instrument?.category} ({app.instrument?.accuracyClass})</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {app.scheduledDate ? new Date(app.scheduledDate).toLocaleDateString('en-IN') : 'Queue Pending'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold uppercase text-[10px]">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {app.certificate ? (
                        <a
                          href={`/verify/${app.certificate.certificateNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Seal</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Testing in Lab</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
