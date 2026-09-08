import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { analyticsApi, applicationApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StateAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Allocation State
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [allocating, setAllocating] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, officersRes] = await Promise.all([
        analyticsApi.getDashboard(),
        applicationApi.getAll({ state: user?.state }),
        authApi.getOfficers({ state: user?.state })
      ]);
      setStats(statsRes.data?.data);
      setApplications(appsRes.data?.data || []);
      setOfficers(officersRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching state admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (appId: string, officerId: string) => {
    if (!appId || !officerId) return;
    setAllocating(true);
    try {
      await applicationApi.allocate({
        applicationId: appId,
        officerId
      });
      alert('Verification job successfully allocated to jurisdictional officer.');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Allocation failed.');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold uppercase">
                State Legal Metrology Controller
              </span>
              <span className="text-xs text-slate-500 font-medium">State / UT: {user?.state}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Statewide Compliance & Officer Management
            </h1>
            <p className="text-xs text-slate-500">
              Jurisdiction pendency monitoring, officer deployment, and enforcement analytics across districts.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">State Controller</span>
            <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
          </div>
        </div>

        {/* State KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>State Commercial Units</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-2">
              {stats?.totalStateInstruments || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered weights & measures</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>State Compliance Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.complianceRate ?? 100}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Instruments with active stamp</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Active Field Officers (LMOs)</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              {officers.length || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Deployed across inspection zones</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Pendency / In-Flight</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {stats?.pendingApplications || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Applications awaiting action</div>
          </div>
        </div>

        {/* Allocation Workbench */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Application Allocation & Workload Distribution</h3>
            <p className="text-xs text-slate-500">Assign incoming trader verification requests to jurisdictional LMOs or approved GATCs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">App Number</th>
                  <th className="py-3 px-6">Trader & Location</th>
                  <th className="py-3 px-6">Instrument</th>
                  <th className="py-3 px-6">Current Allocation</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Assign Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-blue-900">{app.applicationNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.trader?.fullName}</div>
                      <div className="text-[10px] text-slate-500">{app.instrument?.installationAddress}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{app.instrument?.serialNumber}</div>
                      <div className="text-[11px] text-slate-500">{app.instrument?.makeAndModel} ({app.instrument?.category})</div>
                    </td>
                    <td className="py-4 px-6">
                      {app.allocatedTo ? (
                        <div className="font-bold text-slate-800">{app.allocatedTo.fullName} ({app.allocatedTo.role})</div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          UNALLOCATED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        onChange={(e) => handleAllocate(app.id, e.target.value)}
                        defaultValue=""
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                      >
                        <option value="" disabled>Re-assign / Allocate...</option>
                        {officers.map((off) => (
                          <option key={off.id} value={off.id}>
                            {off.fullName} ({off.role} - {off.district})
                          </option>
                        ))}
                      </select>
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
