import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Download,
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Lock,
  FileText,
  Key,
  Database,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { certificateApi } from '../../services/api';

export const VerifyPortal: React.FC = () => {
  const { certId } = useParams<{ certId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [inputCertId, setInputCertId] = useState<string>(certId || 'DOCA-PY-2026-00101');
  const [loading, setLoading] = useState<boolean>(false);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProofDetails, setShowProofDetails] = useState<boolean>(false);

  const handleSearch = async (queryId: string) => {
    if (!queryId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await certificateApi.publicVerify(queryId.trim());
      setCertData(res.data);
    } catch (err: any) {
      setCertData(null);
      setError(
        err.response?.data?.message ||
        'INVALID CERTIFICATE: No verified record matching this ID exists in the National Legal Metrology database.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId) {
      setInputCertId(certId);
      handleSearch(certId);
    } else {
      handleSearch('DOCA-PY-2026-00101');
    }
  }, [certId]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCertId) {
      navigate(`/verify/${inputCertId.trim()}`);
      handleSearch(inputCertId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Search Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black tracking-wide uppercase">
            <QrCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Public Crowd-Verification Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Authenticate Legal Metrology Seals
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Scan a shopkeeper's certificate QR code or enter the certificate number to instantly verify statutory calibration records against the Government Central Ledger.
          </p>

          {/* Search Bar (Mobile Responsive) */}
          <form onSubmit={onFormSubmit} className="mt-6 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                placeholder="Enter Certificate No. (e.g. DOCA-PY-2026-00101)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm font-semibold shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify Now'}
            </button>
          </form>

          {/* Quick Pill Demonstrators (Responsive) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-400">Quick Test:</span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setInputCertId('DOCA-PY-2026-00101');
                  navigate('/verify/DOCA-PY-2026-00101');
                  handleSearch('DOCA-PY-2026-00101');
                }}
                className="font-mono text-emerald-800 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 font-bold text-[11px]"
              >
                ✅ DOCA-PY-2026-00101 (Valid)
              </button>
              <button
                onClick={() => {
                  setInputCertId('FAKE-SEAL-TAMPERED-999');
                  navigate('/verify/FAKE-SEAL-TAMPERED-999');
                  handleSearch('FAKE-SEAL-TAMPERED-999');
                }}
                className="font-mono text-red-800 hover:underline bg-red-50 px-2.5 py-1 rounded-lg border border-red-300 font-bold text-[11px]"
              >
                ❌ FAKE-SEAL-999 (Counterfeit)
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Resolving Asymmetric RSA Signature & SHA-256 Ledger...
            </p>
          </div>
        )}

        {/* Error State: Counterfeit or Unregistered Certificate */}
        {!loading && error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-8 space-y-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 sm:p-3 bg-red-100 rounded-2xl text-red-700 shrink-0">
                <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-red-950 font-heading">
                  Statutory Certificate Verification Failed
                </h3>
                <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
                  {error}
                </p>
                <div className="pt-2 text-xs text-red-700 font-bold flex flex-col sm:flex-row items-start sm:items-center gap-1">
                  <span>Advisory:</span>
                  <span className="font-normal text-red-900">
                    Report under Section 30 of Legal Metrology Act, 2009 if presented by a vendor.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Valid Certificate Display */}
        {!loading && certData && certData.data && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden space-y-0 animate-in fade-in duration-300">
            {/* Verification Seal Banner (Mobile Responsive) */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-700/50">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                  <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider border border-emerald-400/40">
                      {certData.status || 'VALID'}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-emerald-200 font-mono">
                      Signature: {certData.signatureIntegrity || 'VALID'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight mt-1 font-heading">
                    Officially Verified & Stamped
                  </h2>
                  <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
                    Authentic statutory verification record anchored in Government Legal Metrology database.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto bg-black/25 p-3 rounded-2xl border border-white/10 backdrop-blur-xs text-left sm:text-right">
                <div className="text-[10px] sm:text-[11px] text-emerald-200 font-bold uppercase tracking-wider">Statutory Validity</div>
                <div className="text-xl sm:text-2xl font-black text-white font-heading">
                  {certData.daysRemaining} Days Left
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-200/90 font-mono">
                  Valid Upto: {new Date(certData.data.validityExpiryDate).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Certificate Meta Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Certificate Number</div>
                  <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                    {certData.data.certificateNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Issue Date</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {new Date(certData.data.issueDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Public Key Fingerprint</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {certData.data.publicKeyId || 'DOCA-LM-ROOT-KEY-2026'}
                  </div>
                </div>
              </div>

              {/* Grid 2-col: Instrument & Stamping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Instrument Specs */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Verified Instrument Specifications</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Category:</span>
                      <span className="font-bold text-slate-800 text-right">{certData.data.instrument.category}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Serial Number:</span>
                      <span className="font-bold font-mono text-blue-900 text-right">{certData.data.instrument.serialNumber}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Make & Model:</span>
                      <span className="font-bold text-slate-800 text-right max-w-[65%]">{certData.data.instrument.makeAndModel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Model Approval No:</span>
                      <span className="font-mono text-slate-700 text-right">{certData.data.instrument.modelApprovalNumber}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Max Capacity:</span>
                      <span className="font-bold text-slate-900 text-right">{certData.data.instrument.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Accuracy Class:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-right">
                        {certData.data.instrument.accuracyClass}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Stamping & Authority */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Stamping & Authority</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Physical Security Seal:</span>
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {certData.data.stampingDetails.securitySealNumber}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Working Standards:</span>
                      <span className="font-medium text-slate-800 text-right max-w-[65%]">{certData.data.stampingDetails.testWeightsUsed}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Observed Test Error:</span>
                      <span className="font-bold text-emerald-700 text-right">{certData.data.stampingDetails.observedError} (PASSED)</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                      <span className="text-slate-500 whitespace-nowrap">Issuing Officer:</span>
                      <span className="font-bold text-slate-900 text-right">{certData.data.issuingAuthority.officerName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Jurisdiction:</span>
                      <span className="text-slate-700 text-right">{certData.data.issuingAuthority.jurisdiction}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500 whitespace-nowrap">Establishment / Owner:</span>
                      <span className="font-bold text-slate-900 text-right max-w-[65%]">{certData.data.owner.organization} ({certData.data.owner.name})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Digital Proof Hash Box */}
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs space-y-2 font-mono border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-slate-400 font-bold text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>SHA-256 Asymmetric Digital Proof Hash:</span>
                  </div>
                  <button
                    onClick={() => setShowProofDetails(!showProofDetails)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-sans font-bold flex items-center gap-1"
                  >
                    <span>{showProofDetails ? 'Hide Proof Details' : 'Show Crypto Proof Details'}</span>
                    {showProofDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="break-all text-emerald-400 text-xs select-all bg-black/40 p-2.5 rounded-xl border border-emerald-950">
                  {certData.data.signedPayloadHash}
                </div>

                {showProofDetails && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-300 space-y-1 animate-in fade-in duration-150">
                    <p>
                      <strong>Cryptographic Guarantee:</strong> This verification record is mathematically sealed using an RSA-2048 private key held exclusively by the Department of Consumer Affairs. Any unauthorized modification to the instrument serial number, capacity, or security seal breaks the canonical hash and fails verification.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Signature Algorithm: SHA256withRSA | Verification Authority: Central Legal Metrology Division
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: PDF Download & Print */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  Statutory Certificate generated pursuant to Rule 27 of Legal Metrology (General) Rules, 2011.
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={certificateApi.downloadPdfUrl(certData.data.certificateNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Stamped PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
