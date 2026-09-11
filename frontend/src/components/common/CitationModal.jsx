import React from 'react';
import { X, FileText, CheckCircle2, Copy, Sparkles, Shield, Bookmark, ExternalLink } from 'lucide-react';
import { useRoleTheme } from '../../context/RoleThemeContext';

export const CitationModal = ({ citation, isOpen, onClose }) => {
  const { isAdmin } = useRoleTheme();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
          isAdmin
            ? 'glass-panel-admin border-cyan-500/40 text-slate-100'
            : 'glass-panel-officer border-amber-500/40 text-slate-100'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
              isAdmin
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                isAdmin
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {citation.cluster || citation.category || 'Stratigraphy'}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {Math.round(citation.score * 100)}% Semantic Match
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {citation.docTitle || 'Geological Strata Survey'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ref ID: {citation.docId} • Chunk: {citation.chunkId}
            </p>
          </div>
        </div>

        {/* Section Heading & Key Parameters Bar */}
        {citation.meta && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {citation.meta.ucs_mpa && (
              <div>
                <span className="text-[10px] text-slate-400 block">UCS Compressive</span>
                <span className="text-xs font-semibold text-cyan-300">{citation.meta.ucs_mpa}</span>
              </div>
            )}
            {citation.meta.rqd_percent && (
              <div>
                <span className="text-[10px] text-slate-400 block">RQD Quality</span>
                <span className="text-xs font-semibold text-amber-300">{citation.meta.rqd_percent}</span>
              </div>
            )}
            {citation.meta.density_g_cm3 && (
              <div>
                <span className="text-[10px] text-slate-400 block">Strata Density</span>
                <span className="text-xs font-semibold text-slate-200">{citation.meta.density_g_cm3}</span>
              </div>
            )}
            {citation.meta.statuteRef && (
              <div>
                <span className="text-[10px] text-slate-400 block">DGMS Statute</span>
                <span className="text-xs font-semibold text-emerald-300">{citation.meta.statuteRef}</span>
              </div>
            )}
            {citation.meta.waterYield && (
              <div>
                <span className="text-[10px] text-slate-400 block">Aquifer Yield</span>
                <span className="text-xs font-semibold text-blue-300">{citation.meta.waterYield}</span>
              </div>
            )}
            {citation.meta.gasContent && (
              <div>
                <span className="text-[10px] text-slate-400 block">CBM Gas Volume</span>
                <span className="text-xs font-semibold text-amber-300">{citation.meta.gasContent}</span>
              </div>
            )}
          </div>
        )}

        {/* Full Chunk Text */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{citation.heading}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied to Clipboard' : 'Copy Passage'}
            </button>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed max-h-60 overflow-y-auto">
            {citation.text}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ministry of Mines Verified Source Index</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-medium text-xs transition-colors ${
              isAdmin
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
