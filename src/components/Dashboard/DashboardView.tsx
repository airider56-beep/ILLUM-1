import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Search, 
  ArrowRight, 
  Clock, 
  FolderKanban,
  FileText
} from 'lucide-react';
import { ProjectSummary } from '../../types/navigation';

interface DashboardViewProps {
  onNewProject: () => void;
  onOpenProject: (project: ProjectSummary) => void;
  projects: ProjectSummary[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewProject,
  onOpenProject,
  projects,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 • Verified Source Analysis & Dynamic 8s Formula</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to ILLYUM
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transform your story material into faithful, source-grounded voiceover scripts, Google Flow-ready video prompts, dual thumbnail concepts, and distinct YouTube & Instagram SEO packages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onNewProject}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Skills Interactive Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>The 4 Approved Skills</span>
            <span className="text-xs font-normal text-slate-400">(Strict boundaries enforced)</span>
          </h2>
          <span className="text-xs text-indigo-400 font-medium">Single Source of Truth Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Skill 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                Skill 1
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Story-to-Script</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mandatory source analysis grounding, &le;8s per part formula, pure Devanagari Hindi or English.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Input: Source Story</span>
              <span className="text-emerald-400 font-medium">Phase 3 Active</span>
            </div>
          </div>

          {/* Skill 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between opacity-80">
            <div>
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-3">
                <Video className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
                Skill 2
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Video Prompts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Flow-compatible visual prompts inheriting project aspect ratio (9:16 or 16:9).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Phase 4</span>
              <span className="text-amber-400 font-medium">Gated (Pending Acceptance)</span>
            </div>
          </div>

          {/* Skill 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between opacity-80">
            <div>
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">
                Skill 3
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Thumbnail Prompts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exactly two distinct options (A & B) utilizing saved aspect ratio.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Phase 5</span>
              <span className="text-amber-400 font-medium">Gated</span>
            </div>
          </div>

          {/* Skill 4 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between opacity-80">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Skill 4
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Story & Script SEO</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separate YouTube & Instagram packages. Exact hook as YT title. Transparent keyword evidence.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Phase 6</span>
              <span className="text-amber-400 font-medium">Gated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <span>Recent Projects</span>
          </h2>
          <span className="text-xs text-slate-400">
            {projects.length} project{projects.length === 1 ? '' : 's'} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const is169 = proj.aspectRatio === '16:9';
            const durationLabel = is169
              ? `${proj.durationMinutes || Math.round((proj.duration || 180)/60)}m (${proj.calculatedPartCount || Math.ceil((proj.duration || 180)/8)}p)`
              : `${proj.duration || 32}s (${proj.selectedPartCount || Math.round((proj.duration || 32)/8)}p)`;

            return (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                      {proj.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {proj.status}
                    </span>
                    {(proj as any).isDemo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Demo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 flex-wrap">
                  {proj.aspectRatio && (
                    <span className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-medium">
                      {proj.aspectRatio}
                    </span>
                  )}
                  {proj.language && (
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                      {proj.language}
                    </span>
                  )}
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                    {durationLabel}
                  </span>
                  <div className="flex items-center gap-1 ml-auto text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                  <span>Open Project Workspace</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
