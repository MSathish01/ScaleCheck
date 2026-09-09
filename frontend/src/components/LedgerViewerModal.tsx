import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  Database,
  Zap,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { ledgerApi } from '../services/api';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LedgerViewerModal: React.FC<LedgerModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [tampering, setTampering] = useState<boolean>(false);
  const [repairing, setRepairing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await ledgerApi.getLedger(20);
      setEntries(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await ledgerApi.validateChain();
      setValidation(res.data?.data);
    } catch (err) {
      console.error('Failed to validate chain', err);
    } finally {
      setValidating(false);
    }
  };

  const handleSimulateTamper = async () => {
    setTampering(true);
    setActionMessage(null);
    try {
      await ledgerApi.simulateTamper(2);
      setActionMessage('⚠️ Simulating intrusion: Block #2 payload altered in DB without hash recomputation.');
      await fetchLedger();
      await handleValidate();
    } catch (err: any) {
      setActionMessage(err.response?.data?.message || 'Tamper simulation failed.');
    } finally {
      setTampering(false);
    }
  };

  const handleRepairChain = async () => {
    setRepairing(true);
    setActionMessage(null);
    try {
      await ledgerApi.repairChain();
      setActionMessage('🛡️ Cryptographic self-healing: Re-hashed state chain. Mathematical continuity restored.');
      await fetchLedger();
      await handleValidate();
    } catch (err: any) {
      setActionMessage(err.response?.data?.message || 'Repair routine failed.');
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
      handleValidate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900/60 rounded-xl text-blue-400 border border-blue-700/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2 font-heading">
                Verification Ledger Explorer
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  SHA-256 Chained
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical proof of non-repudiation: every statutory inspection is chained to its predecessor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Status & Action Banner */}
        <div className="px-6 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            {validation?.isValid ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Chain Continuity: 100% INTACT & UNBROKEN ({validation.totalBlocks} Blocks Verified)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-bold">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{validation?.errorMessage || 'Verifying cryptographic continuity...'}</span>
              </div>
            )}
          </div>

          {/* Hackathon Evaluator Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateTamper}
              disabled={tampering || repairing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/70 hover:bg-red-800 text-red-100 text-xs font-bold transition border border-red-700/60 disabled:opacity-50"
              title="Demonstrate tamper detection for judges"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{tampering ? 'Tampering...' : 'Simulate Tamper'}</span>
            </button>

            <button
              onClick={handleRepairChain}
              disabled={tampering || repairing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 text-xs font-bold transition border border-emerald-700/60 disabled:opacity-50"
              title="Repair chain integrity"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{repairing ? 'Repairing...' : 'Auto-Repair'}</span>
            </button>

            <button
              onClick={handleValidate}
              disabled={validating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${validating ? 'animate-spin' : ''}`} />
              <span>{validating ? 'Checking...' : 'Re-verify'}</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Toast Banner */}
        {actionMessage && (
          <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-amber-300 font-mono flex items-center gap-2 animate-in fade-in duration-150">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Ledger Blocks List */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading verified ledger blocks...</div>
          ) : (
            entries.map((block, idx) => (
              <div key={block.sequence} className="relative">
                {/* Block Connector Line */}
                {idx > 0 && (
                  <div className="absolute -top-4 left-7 w-0.5 h-4 bg-blue-700/40 pointer-events-none" />
                )}

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 transition hover:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-900/60 text-blue-300 font-bold border border-blue-800/60">
                        Block #{block.sequence}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-bold text-[11px]">
                        {block.eventType}
                      </span>
                      <span className="text-slate-400 text-[11px] font-sans">
                        {new Date(block.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Entity: {block.entityType} ({block.entityId})</span>
                  </div>

                  {/* Hash Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1 mb-0.5 font-sans font-bold">
                        <LinkIcon className="w-3 h-3 text-slate-400" />
                        <span>Previous Block Hash:</span>
                      </div>
                      <div className="text-slate-300 break-all">{block.previousHash}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1 mb-0.5 font-sans font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Record Hash (SHA-256):</span>
                      </div>
                      <div className="text-emerald-300 break-all">{block.recordHash}</div>
                    </div>
                  </div>

                  {/* Payload Preview */}
                  <div className="bg-slate-900/40 p-2.5 rounded-xl text-[11px] text-slate-400 break-all border border-slate-900">
                    <span className="text-slate-300 font-bold font-sans">Canonical State: </span>
                    {block.payload}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
