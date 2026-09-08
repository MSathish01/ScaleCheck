import React, { useState, useEffect } from 'react';
import {
  Globe,
  Database,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Award,
  Users,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { analyticsApi, ledgerApi } from '../../services/api';

export const CentralAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tampering, setTampering] = useState<boolean>(false);
  const [repairing, setRepairing] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ledgerRes, validRes] = await Promise.all([
        analyticsApi.getDashboard(),
        ledgerApi.getLedger(15),
        ledgerApi.validateChain()
      ]);
      setStats(statsRes.data?.data);
      setLedgerEntries(ledgerRes.data?.data || []);
      setValidationResult(validRes.data?.data);
    } catch (err) {
      console.error('Error fetching Central Admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateTamper = async () => {
    setTampering(true);
    try {
      const res = await ledgerApi.simulateTamper(2);
      alert(res.data?.message);
      // Re-validate to showcase the detected tamper!
      const validRes = await ledgerApi.validateChain();
      setValidationResult(validRes.data?.data);
      const ledgerRes = await ledgerApi.getLedger(15);
      setLedgerEntries(ledgerRes.data?.data || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tamper simulation failed.');
    } finally {
      setTampering(false);
    }
  };

  const handleRepairChain = async () => {
    setRepairing(true);
    try {
      const res = await ledgerApi.repairChain();
      alert(res.data?.message);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Repair failed.');
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                DoCA National Command Center
              </span>
              <span className="text-xs text-slate-400">Government of India</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
              Legal Metrology National Oversight & Ledger Integrity
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-0.5">
              Real-time cross-state enforcement analytics, national compliance monitoring, and cryptographic blockchain-inspired audit verification.
            </p>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <span className="text-xs text-slate-400">National Compliance</span>
            <div className="text-3xl font-black text-emerald-400">
              {stats?.nationalComplianceRate ?? 100}%
            </div>
          </div>
        </div>

        {/* National KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>National Commercial Scales</span>
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats?.totalNationalInstruments || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Total across all States & UTs</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Active Stamped Certificates</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats?.totalCertificates || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Asymmetrically signed seals</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Registered Traders</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              {stats?.totalTraders || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Commercial establishments</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Ledger Block Height</span>
              <Database className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              #{stats?.totalLedgerBlocks || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Append-only audit chain</div>
          </div>
        </div>

        {/* Ledger Integrity & Adversarial Tamper Demonstration Workbench */}
        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  Blockchain-Inspired Tamper-Evident Verification Ledger
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Each verification event computes <code className="text-emerald-400">SHA256(prevHash + event + payload + timestamp)</code>. Any alteration invalidates all downstream blocks.
              </p>
            </div>

            {/* Evaluator Demonstration Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSimulateTamper}
                disabled={tampering}
                title="Demonstrates mathematical fraud detection by injecting unauthorized payload modification"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{tampering ? 'Injecting Attack...' : 'Simulate Adversarial Tamper'}</span>
              </button>

              <button
                onClick={handleRepairChain}
                disabled={repairing}
                title="Re-hashes and restores chain integrity"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{repairing ? 'Restoring...' : 'Restore Chain'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Chain Integrity Status */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {validationResult?.isValid ? (
                <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 bg-red-950 text-red-400 rounded-xl border border-red-800 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">
                  Mathematical Audit Status
                </div>
                <div className={`text-base font-black ${validationResult?.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {validationResult?.isValid
                    ? `CHAIN INTEGRITY VERIFIED (Blocks 1 through #${validationResult.totalBlocks} Mathematical Proof Intact)`
                    : `INTEGRITY VIOLATION DETECTED: Block #${validationResult?.brokenAtSequence}`}
                </div>
                {!validationResult?.isValid && (
                  <p className="text-xs text-red-300 mt-0.5 font-mono">
                    {validationResult?.errorMessage}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Live Recent Ledger Blocks Table */}
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Seq</th>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Entity</th>
                  <th className="py-2 px-3">Chained Record Hash (SHA-256)</th>
                  <th className="py-2 px-3">Previous Block Hash</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerEntries.map((b) => (
                  <tr key={b.sequence} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-blue-400">#{b.sequence}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">{b.eventType}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.entityType}</td>
                    <td className="py-2.5 px-3 text-emerald-400 break-all max-w-xs">{b.recordHash.substring(0, 24)}...</td>
                    <td className="py-2.5 px-3 text-slate-400 break-all max-w-xs">{b.previousHash.substring(0, 24)}...</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      {new Date(b.timestamp).toLocaleTimeString('en-IN')}
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
