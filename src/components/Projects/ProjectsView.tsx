import React, { useState } from 'react';
import { 
  FolderKanban, 
  PlusCircle, 
  Search, 
  Clock, 
  ArrowRight, 
  Filter,
  Trash2,
  BookOpen
} from 'lucide-react';
import { ProjectRecord } from '../../types/navigation';

interface ProjectsViewProps {
  projects: ProjectRecord[];
  onOpenProject: (project: ProjectRecord) => void;
  onNewProject: () => void;
  onDeleteProject?: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <span>Projects</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your story creation workspaces. All data is persisted to the server file database.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Showing all {filteredProjects.length}</span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-300">No projects found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery ? 'Try clearing your search query.' : 'Create your first story project to begin.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNewProject}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => {
            const wordCount = proj.sourceStory?.wordCount || 0;
            const durationLabel = proj.aspectRatio === '16:9'
              ? `${proj.durationMinutes || Math.round((proj.duration || 180)/60)}m (${proj.calculatedPartCount || Math.ceil((proj.duration || 180)/8)}p)`
              : `${proj.duration || 32}s (${proj.selectedPartCount || Math.round((proj.duration || 32)/8)}p)`;

            return (
              <div
                key={proj.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all hover:bg-slate-900/90 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        proj.status === 'Source Ready'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {proj.status}
                      </span>
                      {proj.isDemo && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onOpenProject(proj)}
                    className="font-semibold text-base text-slate-100 group-hover:text-indigo-300 transition-colors mb-2 cursor-pointer line-clamp-2"
                  >
                    {proj.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                    {proj.aspectRatio ? (
                      <span className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-medium">
                        {proj.aspectRatio}
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px]">
                        Ratio Missing
                      </span>
                    )}
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {proj.language || 'English'}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {durationLabel}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {wordCount > 0 ? `${wordCount} words` : 'Empty story'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenProject(proj)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  {onDeleteProject && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.name}"?`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
