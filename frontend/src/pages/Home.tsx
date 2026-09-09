import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  QrCode,
  Database,
  Smartphone,
  TrendingUp,
  Award,
  ArrowRight,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  Lock,
  Cpu,
  RefreshCw,
  Search,
  Building2,
  FileText
} from 'lucide-react';
import { certificateApi } from '../services/api';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  // Interactive Simulator State for Live Evaluation
  const [simCertId, setSimCertId] = useState<string>('DOCA-PY-2026-00101');
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const runVerificationSim = async (certNumber: string) => {
    setSimCertId(certNumber);
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await certificateApi.publicVerify(certNumber);
      setSimResult({ success: true, data: res.data });
    } catch (err: any) {
      setSimResult({
        success: false,
        error: err.response?.data?.message || 'Verification failed. Unrecognized certificate or altered seal.'
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-8 sm:p-14 shadow-2xl border border-blue-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official Legal Metrology e-Governance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight font-heading">
            Scale<span className="text-blue-400">Check</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
            Smart Online Verification & Tamper-Proof Certification System for Weights and Measures across India. Enforcing statutory calibration compliance under the <strong className="text-white font-semibold">Legal Metrology Act, 2009</strong> with cryptographic proofs and offline-first field inspections.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-2">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-glow-saffron transition transform hover:-translate-y-0.5"
            >
              <QrCode className="w-5 h-5 text-slate-950" />
              <span>Crowd-Verify via QR</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition hover:-translate-y-0.5"
            >
              <span>Stakeholder Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-sm border border-emerald-500/50 transition hover:-translate-y-0.5"
            >
              <Smartphone className="w-4 h-4" />
              <span>Field Officer PWA</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden lg:block">
          <Scale className="w-80 h-80 text-blue-300" />
        </div>
      </div>

      {/* Live National Metric Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-heading">RSA-2048</div>
            <div className="text-xs text-slate-500 font-medium">Asymmetric Keypair</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-heading">SHA-256</div>
            <div className="text-xs text-slate-500 font-medium">Immutable Block Ledger</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-heading">100% Offline</div>
            <div className="text-xs text-slate-500 font-medium">Field Inspection PWA</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-heading">Schedule IX</div>
            <div className="text-xs text-slate-500 font-medium">DoCA Statutory Format</div>
          </div>
        </div>
      </div>

      {/* Interactive Verification Simulator (Flagship Demo Feature) */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-700" />
              <span>Interactive Statutory Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Live Cryptographic Verification Demo
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Test live mathematical signature validation and tamper-detection right here without navigating away.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">Quick Test:</span>
            <button
              onClick={() => runVerificationSim('DOCA-PY-2026-00101')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100 transition"
            >
              ✅ Valid Fuel Dispenser
            </button>
            <button
              onClick={() => runVerificationSim('FAKE-TAMPERED-SEAL-999')}
              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-300 font-bold hover:bg-red-100 transition"
            >
              ❌ Counterfeit / Tampered Seal
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={simCertId}
              onChange={(e) => setSimCertId(e.target.value)}
              placeholder="Enter Certificate Number (e.g. DOCA-PY-2026-00101)"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm font-semibold shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={() => runVerificationSim(simCertId)}
            disabled={simLoading || !simCertId.trim()}
            className="px-8 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {simLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Crypto Hash...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verify Signature</span>
              </>
            )}
          </button>
        </div>

        {/* Live Result Display */}
        {simResult && (
          <div className="animate-in fade-in slide-in-from-top-3 duration-200">
            {simResult.success ? (
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="text-sm font-black text-emerald-950">
                        OFFICIALLY VERIFIED & STAMPED
                      </div>
                      <div className="text-xs text-emerald-800">
                        Cryptographic RSA-2048 signature matches Government root keypair.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-black text-xs uppercase">
                    Status: {simResult.data.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-slate-400">Equipment:</span>{' '}
                    <span className="font-bold text-slate-800">{simResult.data.data?.instrument?.makeAndModel || 'Commercial Instrument'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Security Seal:</span>{' '}
                    <span className="font-mono font-bold text-emerald-800">{simResult.data.data?.stampingDetails?.securitySealNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Issuing Officer:</span>{' '}
                    <span className="font-bold text-slate-800">{simResult.data.data?.officer?.name || 'Authorized Inspector'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="text-sm font-black text-red-950">
                      COUNTERFEIT / TAMPER ALERT
                    </div>
                    <div className="text-xs text-red-800">
                      {simResult.error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4-Pillar Digital Governance Architecture */}
      <div>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Comprehensive Digital Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Four Connected Stakeholder Portals
          </h2>
          <p className="text-sm text-slate-500">
            Purpose-built workflows connecting the citizen, ground traders, field officers, and national administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Trader */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                🌾
              </div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                Trader Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Register weighing equipment, track predictive recalibration alerts, view automated statutory fees, and download stamped certificates.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 pt-2"
            >
              <span>Access Trader Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: LMO Field Officer */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                ⚖️
              </div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                Field Officer PWA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduct calibration tests with automated Maximum Permissible Error (MPE) checks, GPS geotagging, and 100% offline IndexedDB sync.
              </p>
            </div>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-800 pt-2"
            >
              <span>Launch Field App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: GATC Testing Lab */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                🔬
              </div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                GATC Test Lab
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Government-Approved Testing Laboratories for high-precision analytical balances and industrial weighbridges under Rule 27.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 hover:text-purple-800 pt-2"
            >
              <span>Access Lab Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: National Command */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                National Command
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                DoCA Central & State Admin oversight dashboard tracking state compliance rates, officer backlogs, and real-time ledger continuity.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 hover:text-emerald-800 pt-2"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
