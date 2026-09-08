import React from 'react';
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
  FileText,
  ExternalLink
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
            <span>Official Legal Metrology e-Governance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Scale<span className="text-blue-400">Check</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            Smart Online Verification & Tamper-Proof Certification System for Weights and Measures across India. Enforcing statutory compliance under the <strong className="text-white">Legal Metrology Act, 2009</strong>.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition transform hover:-translate-y-0.5"
            >
              <QrCode className="w-5 h-5 text-slate-950" />
              <span>Crowd-Verify via QR</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition"
            >
              <span>Stakeholder Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-sm border border-emerald-500/50 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open Mobile Field App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Scale className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Core Architectural Differentiators */}
      <div>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Next-Generation Governance
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Built Beyond Simple Digitization
          </h2>
          <p className="text-sm text-slate-500">
            Engineered with cryptographic proofs, mathematical non-repudiation, and offline capability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Asymmetrically Signed Certificates
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every digital certificate is signed using asymmetric cryptographic keys at issuance. The embedded QR code encodes live verification URLs and SHA-256 payload hashes, enabling instant crowd-verification without login.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Append-Only Verification Ledger
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every state transition—from registration to inspection and issuance—is written to an append-only hash-chained ledger. Any attempt to modify historic records mathematically breaks the chain.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Offline-First Mobile Field App
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed for field officers operating in rural mandis and remote locations with intermittent or zero cellular connectivity. Local IndexedDB queue with automatic background synchronization.
            </p>
          </div>
        </div>
      </div>

      {/* Stakeholder Access Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Stakeholder Portals & Access Points</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-extrabold text-blue-900 text-sm">Trader / Owner</div>
            <p className="text-slate-500">Register instruments, submit verification applications, download certificates, and view early-renewal incentives.</p>
            <Link to="/login" className="inline-block text-blue-700 font-bold hover:underline pt-1">
              Trader Portal &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-extrabold text-indigo-900 text-sm">Field Officer (LMO)</div>
            <p className="text-slate-500">View assigned verification queue, schedule field visits, record test weights and seal numbers, trigger certificate signing.</p>
            <Link to="/login" className="inline-block text-indigo-700 font-bold hover:underline pt-1">
              LMO Workbench &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-extrabold text-teal-900 text-sm">State Controller</div>
            <p className="text-slate-500">Statewide compliance monitoring, district pendency tracking, and dynamic allocation of jobs across inspection zones.</p>
            <Link to="/login" className="inline-block text-teal-700 font-bold hover:underline pt-1">
              State Dashboard &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-extrabold text-amber-900 text-sm">Central Admin (DoCA)</div>
            <p className="text-slate-500">National command center, cross-state performance heatmap, and cryptographic ledger integrity validator.</p>
            <Link to="/login" className="inline-block text-amber-700 font-bold hover:underline pt-1">
              National Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
