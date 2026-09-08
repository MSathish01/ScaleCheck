import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle, RefreshCw, Link as LinkIcon, Database } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
      handleValidate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400 border border-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Append-Only Verification Ledger
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  SHA-256 Hash-Chained
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical proof of non-repudiation: every state transition is cryptographically chained to its predecessor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Status Banner */}
        <div className="px-6 py-3.5 bg-slate-800/60 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            {validation?.isValid ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Chain Integrity: VERIFIED & UNBROKEN ({validation.totalBlocks} Blocks Validated)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>{validation?.errorMessage || 'Validating Ledger Chain...'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${validating ? 'animate-spin' : ''}`} />
              {validating ? 'Validating Hashes...' : 'Re-verify Hashes'}
            </button>
          </div>
        </div>

        {/* Ledger Blocks List */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading ledger blocks...</div>
          ) : (
            entries.map((block) => (
              <div
                key={block.sequence}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold">
                      Block #{block.sequence}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold">
                      {block.eventType}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(block.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">Entity: {block.entityType} ({block.entityId})</span>
                </div>

                {/* Hash Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mb-2">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <LinkIcon className="w-3 h-3 text-slate-500" />
                      <span>Previous Hash:</span>
                    </div>
                    <div className="text-slate-300 break-all">{block.previousHash}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Record Hash (SHA-256):</span>
                    </div>
                    <div className="text-emerald-300 break-all">{block.recordHash}</div>
                  </div>
                </div>

                {/* Payload Preview */}
                <div className="bg-slate-900/40 p-2 rounded text-[11px] text-slate-400 break-all">
                  <span className="text-slate-400 font-semibold">Payload Snapshot: </span>
                  {block.payload}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
