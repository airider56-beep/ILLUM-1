import React from 'react';
import { Info, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface PhasePlaceholderProps {
  phaseNumber: number;
  phaseTitle: string;
  description: string;
  inputsRequired: string[];
  dependencyGate?: string;
  acceptanceCriteria: string[];
}

export const PhasePlaceholder: React.FC<PhasePlaceholderProps> = ({
  phaseNumber,
  phaseTitle,
  description,
  inputsRequired,
  dependencyGate,
  acceptanceCriteria,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <span>Phase {phaseNumber} Implementation Item</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-100">{phaseTitle}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg shrink-0">
          <Lock className="w-4 h-4" />
          <span>Scheduled for Phase {phaseNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Required Inputs */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Strict Input Boundaries</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {inputsRequired.map((input, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{input}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dependency Gate */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Workflow & Approval Gate</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dependencyGate || 'Requires explicit upstream user approval before execution.'}
          </p>
        </div>
      </div>

      {/* Acceptance Criteria Highlights */}
      <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Planned Verification Criteria</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {acceptanceCriteria.map((crit, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-800/70 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/50"
            >
              {crit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
