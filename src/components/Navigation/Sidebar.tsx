import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  Settings, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { MainView } from '../../types/navigation';

interface SidebarProps {
  currentView: MainView;
  onNavigate: (view: MainView) => void;
  activeProjectName?: string;
  hasActiveProject?: boolean;
  onOpenWorkspace?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeProjectName,
  hasActiveProject,
  onOpenWorkspace,
}) => {
  const navItems = [
    {
      id: 'dashboard' as MainView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & quick start',
    },
    {
      id: 'projects' as MainView,
      label: 'Projects',
      icon: FolderKanban,
      description: 'Saved workspaces',
    },
    {
      id: 'create_project' as MainView,
      label: 'Create New Project',
      icon: PlusCircle,
      description: 'Start fresh story workflow',
    },
    {
      id: 'settings' as MainView,
      label: 'Settings',
      icon: Settings,
      description: 'System & configuration',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Project Workspace Shortcut */}
        {hasActiveProject && (
          <div className="pt-4 border-t border-slate-800">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Project
            </p>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                currentView === 'workspace'
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold truncate text-slate-100">
                  {activeProjectName || 'Current Project'}
                </div>
                <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                  <span>Open 5-Tab Workspace</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
          </div>
        )}

        {/* 4 Skills Quick Architecture Map */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>4 Approved Skills</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>1. Story-to-Script</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Duration-driven</span>
            </div>
            <div className="flex items-center justify-between">
              <span>2. Video Prompts</span>
              <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Google Flow</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3. Thumbnail Prompts</span>
              <span className="text-[10px] text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">2 Options</span>
            </div>
            <div className="flex items-center justify-between">
              <span>4. SEO Packages</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">YT & IG Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Owner Mode</span>
          <span className="text-slate-300 font-medium">Single Operator</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Sprint Status</span>
          <span className="text-indigo-400 font-medium">Phase 1 Foundation</span>
        </div>
      </div>
    </aside>
  );
};
