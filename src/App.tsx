import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProjectsView } from './components/Projects/ProjectsView';
import { CreateProjectView } from './components/Projects/CreateProjectView';
import { SettingsView } from './components/Settings/SettingsView';
import { WorkspaceView } from './components/Workspace/WorkspaceView';
import { MainView, ProjectRecord } from './types/navigation';
import { fetchProjects, createProject, deleteProjectApi } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<MainView>(() => {
    try {
      const saved = localStorage.getItem('illyum_current_view');
      if (saved && ['dashboard', 'projects', 'create_project', 'settings', 'workspace'].includes(saved)) {
        return saved as MainView;
      }
    } catch (e) {}
    return 'dashboard';
  });
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load persistent projects from server API on mount
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const list = await fetchProjects();
      setProjects(list);
      
      const savedId = localStorage.getItem('illyum_active_project_id');
      const found = savedId ? list.find((p) => p.id === savedId) : null;
      if (found) {
        setActiveProject(found);
      } else if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
      }
      setServerError(null);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setServerError('Could not connect to persistent backend storage. Retrying...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleNavigate = (view: MainView) => {
    setCurrentView(view);
    localStorage.setItem('illyum_current_view', view);
    setMobileMenuOpen(false);
  };

  const handleOpenProject = (project: ProjectRecord) => {
    setActiveProject(project);
    setCurrentView('workspace');
    localStorage.setItem('illyum_active_project_id', project.id);
    localStorage.setItem('illyum_current_view', 'workspace');
    setMobileMenuOpen(false);
  };

  const handleCreateProject = async (newProjData: {
    name: string;
    language: 'Hindi' | 'English';
    aspectRatio: '9:16' | '16:9';
    selectedPartCount?: number;
    durationMinutes?: number;
    duration?: number;
  }) => {
    try {
      const created = await createProject(newProjData);
      setProjects((prev) => [created, ...prev]);
      setActiveProject(created);
      setCurrentView('workspace');
      localStorage.setItem('illyum_active_project_id', created.id);
      localStorage.setItem('illyum_current_view', 'workspace');
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProjectApi(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        const remaining = projects.filter((p) => p.id !== id);
        const nextActive = remaining[0] || null;
        setActiveProject(nextActive);
        if (nextActive) {
          localStorage.setItem('illyum_active_project_id', nextActive.id);
        } else {
          localStorage.removeItem('illyum_active_project_id');
        }
        setCurrentView('projects');
        localStorage.setItem('illyum_current_view', 'projects');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleProjectUpdated = (updated: ProjectRecord) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setActiveProject(updated);
    localStorage.setItem('illyum_active_project_id', updated.id);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'projects':
        return 'Projects';
      case 'create_project':
        return 'Create New Project';
      case 'settings':
        return 'Settings';
      case 'workspace':
        return 'Project Workspace';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentViewTitle={getViewTitle()}
        projectName={currentView === 'workspace' && activeProject ? activeProject.name : undefined}
        onOpenMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {serverError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 text-center">
          {serverError}
        </div>
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            activeProjectName={activeProject?.name}
            hasActiveProject={Boolean(activeProject)}
            onOpenWorkspace={() => setCurrentView('workspace')}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 bg-slate-900 border-r border-slate-800 h-full">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                activeProjectName={activeProject?.name}
                hasActiveProject={Boolean(activeProject)}
                onOpenWorkspace={() => setCurrentView('workspace')}
              />
            </div>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {isLoading && projects.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
              <span>Connecting to persistent storage...</span>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  onNewProject={() => setCurrentView('create_project')}
                  onOpenProject={handleOpenProject}
                  projects={projects}
                />
              )}

              {currentView === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onOpenProject={handleOpenProject}
                  onNewProject={() => setCurrentView('create_project')}
                  onDeleteProject={handleDeleteProject}
                />
              )}

              {currentView === 'create_project' && (
                <CreateProjectView
                  onCreateProject={handleCreateProject}
                  onCancel={() => setCurrentView('projects')}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView onRefreshProjects={loadProjects} />
              )}

              {currentView === 'workspace' && activeProject && (
                <WorkspaceView
                  project={activeProject}
                  onBack={() => setCurrentView('projects')}
                  onProjectUpdated={handleProjectUpdated}
                  onDeleteProject={handleDeleteProject}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
