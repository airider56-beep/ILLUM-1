import React from 'react';
import { BookOpen, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentViewTitle: string;
  projectName?: string;
  onOpenMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentViewTitle,
  projectName,
  onOpenMobileMenu,
  mobileMenuOpen,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black tracking-wider text-sm">
            IL
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-100 text-base leading-tight tracking-tight flex items-center gap-1.5">
              ILLYUM
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase tracking-wider border border-indigo-500/30">
                Phase 1
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Content Creation Studio</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
          <span className="text-slate-500">Location:</span>
          <span className="text-slate-300 font-medium">{currentViewTitle}</span>
          {projectName && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {projectName}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">System Ready</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Baseline:</span>
          <span className="text-slate-200 font-semibold">Master PRD</span>
        </div>
      </div>
    </header>
  );
};
