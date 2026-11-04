import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  HardDrive, 
  Cpu, 
  BookOpen, 
  FileCheck2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { restoreBackup } from '../../services/api';

interface SettingsViewProps {
  onRefreshProjects?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshProjects }) => {
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup';
    setBackupStatus('Backup file downloaded.');
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setErrorMessage(null);
    setBackupStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        await restoreBackup(parsed);
        setBackupStatus('Database restored successfully from backup!');
        if (onRefreshProjects) onRefreshProjects();
        setTimeout(() => setBackupStatus(null), 4000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to restore backup file.');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          <span>System & Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review architecture configurations, persistent storage, and data backup controls.
        </p>
      </div>

      {backupStatus && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupStatus}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Active Storage & Backup Controls (Phase 2 Deliverable) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Server Data Storage & Backup</h3>
                <p className="text-xs text-slate-400">Phase 2: Durable Persistence Active</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live File DB
            </span>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between text-slate-400">
              <span>Database File:</span>
              <span className="text-slate-200 font-mono">/data/projects.json</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Persistence Mechanism:</span>
              <span className="text-emerald-400 font-medium">Server-side filesystem with instant write & restore</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Survives Browser Refresh:</span>
              <span className="text-emerald-400 font-semibold">Yes (Verified)</span>
            </div>
          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download 1-Click Backup (JSON)</span>
            </button>

            <label className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{isRestoring ? 'Restoring...' : 'Restore from Backup File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                disabled={isRestoring}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* AI & Security Configuration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">AI Model Security & Discovery (FR-07)</h3>
                <p className="text-xs text-slate-400">Approved architecture decision #3 & FR-07</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Zero Client Secrets
            </span>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between text-slate-400">
              <span>Model Target:</span>
              <span className="text-slate-200 font-mono">Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Security Rule:</span>
              <span className="text-emerald-400 font-medium">Server-side proxy only; no API keys in frontend</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>FR-07 Discovery & Fallback:</span>
              <span className="text-indigo-400">Scheduled for Phase 7 (Orchestrator) & Phase 8 (Settings UI)</span>
            </div>
          </div>
        </div>

        {/* Operating Rules & PRD Reference */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Project Baseline & Governance</h3>
              <p className="text-xs text-slate-400">Source of truth documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-slate-200">01_MASTER_PRD.md</div>
                <div className="text-[11px] text-slate-400">Product requirements & FR-07</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-slate-200">02_APPROVED_SKILL_SPECIFICATIONS.md</div>
                <div className="text-[11px] text-slate-400">Skills 1–4 specifications</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-slate-200">05_ACCEPTANCE_TESTS.md</div>
                <div className="text-[11px] text-slate-400">Definition of Done (Tests A–G)</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-slate-200">09_SCOPE_GUARDRAILS.md</div>
                <div className="text-[11px] text-slate-400">Anti-drift enforcement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
