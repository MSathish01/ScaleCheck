import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Download,
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Lock
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
      // Auto-load demo certificate
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold tracking-wide uppercase">
            <QrCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Public Crowd-Verification Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('verifyPage.title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {t('verifyPage.subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={onFormSubmit} className="mt-6 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                placeholder={t('verifyPage.inputPlaceholder')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : t('verifyPage.verifyBtn')}
            </button>
          </form>

          {/* Demo Pills */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            <span>Quick Test:</span>
            <button
              onClick={() => {
                setInputCertId('DOCA-PY-2026-00101');
                navigate('/verify/DOCA-PY-2026-00101');
                handleSearch('DOCA-PY-2026-00101');
              }}
              className="font-mono text-blue-700 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
            >
              DOCA-PY-2026-00101 (Valid Stamped)
            </button>
            <button
              onClick={() => {
                setInputCertId('FAKE-CERT-99999');
                navigate('/verify/FAKE-CERT-99999');
                handleSearch('FAKE-CERT-99999');
              }}
              className="font-mono text-red-700 hover:underline bg-red-50 px-2 py-0.5 rounded border border-red-200"
            >
              FAKE-CERT-99999 (Counterfeit Test)
            </button>
          </div>
        </div>

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">
                {t('verifyPage.counterfeitBadge')}
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2 font-medium">
                Statutory Notice: Commercial use of an unverified or counterfeit instrument is punishable under Section 30 of the Legal Metrology Act, 2009.
              </p>
            </div>
          </div>
        )}

        {/* Success Verified Result */}
        {certData && certData.isAuthentic && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Verification Seal Banner */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <ShieldCheck className="w-10 h-10 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-extrabold uppercase tracking-wider border border-emerald-400/40">
                      {certData.status}
                    </span>
                    <span className="text-xs text-emerald-200 font-mono">
                      Algorithm: SHA256withRSA
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mt-1">
                    {t('verifyPage.authenticBadge')}
                  </h2>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Live verification against Government of India National Legal Metrology database.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-emerald-200 font-medium">Certificate Validity</div>
                <div className="text-2xl font-extrabold text-white">
                  {certData.daysRemaining} {t('verifyPage.daysLeft')}
                </div>
                <div className="text-[11px] text-emerald-200">
                  Expires: {new Date(certData.data.validityExpiryDate).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Top Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Certificate Number</div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                    {certData.data.certificateNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Issue Date</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {new Date(certData.data.issueDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Public Key ID</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {certData.data.publicKeyId}
                  </div>
                </div>
              </div>

              {/* Grid 2-col: Instrument & Stamping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instrument Specs */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    {t('verifyPage.instrumentDetails')}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-bold text-slate-800">{certData.data.instrument.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serial Number:</span>
                      <span className="font-bold font-mono text-blue-900">{certData.data.instrument.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Make & Model:</span>
                      <span className="font-bold text-slate-800">{certData.data.instrument.makeAndModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model Approval No:</span>
                      <span className="font-mono text-slate-700">{certData.data.instrument.modelApprovalNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Capacity:</span>
                      <span className="font-bold text-slate-900">{certData.data.instrument.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accuracy Class:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold">
                        {certData.data.instrument.accuracyClass}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stamping & Authority */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    {t('verifyPage.stampingRecord')}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Physical Security Seal:</span>
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {certData.data.stampingDetails.securitySealNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Working Standards:</span>
                      <span className="font-medium text-slate-800 text-right">{certData.data.stampingDetails.testWeightsUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Observed Error:</span>
                      <span className="font-bold text-emerald-700">{certData.data.stampingDetails.observedError} (PASSED)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2">
                      <span className="text-slate-500">Issuing Officer:</span>
                      <span className="font-bold text-slate-900">{certData.data.issuingAuthority.officerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jurisdiction:</span>
                      <span className="text-slate-700">{certData.data.issuingAuthority.jurisdiction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Establishment / Owner:</span>
                      <span className="font-bold text-slate-900">{certData.data.owner.organization} ({certData.data.owner.name})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Digital Proof Hash */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-1 font-mono">
                <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Asymmetric Digital Proof Hash:</span>
                </div>
                <div className="break-all text-emerald-400 text-[11px] select-all">
                  {certData.data.signedPayloadHash}
                </div>
                <p className="text-[10px] text-slate-400 pt-1 font-sans">
                  This mathematical hash is cryptographically signed by the Legal Metrology Officer's private key. Any modification to instrument capacity, validity, or seal number breaks the signature.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <a
                  href={certificateApi.downloadPdfUrl(certData.data.certificateNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('verifyPage.downloadPdf')}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
