import { ProjectRecord } from '../types/navigation';

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to load projects');
  const data = await res.json();
  return data.projects || [];
}

export async function fetchProject(id: string): Promise<ProjectRecord> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error('Failed to load project');
  const data = await res.json();
  return data.project;
}

export async function createProject(payload: {
  name: string;
  language: 'Hindi' | 'English';
  aspectRatio: '9:16' | '16:9';
  selectedPartCount?: number;
  durationMinutes?: number;
  duration?: number;
}): Promise<ProjectRecord> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create project');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(
  id: string,
  payload: Partial<Pick<ProjectRecord, 'name' | 'duration' | 'language' | 'status' | 'aspectRatio' | 'selectedPartCount' | 'durationMinutes'>>
): Promise<ProjectRecord> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update project');
  }
  const data = await res.json();
  return data.project;
}

export async function analyzeSourceStory(
  id: string
): Promise<{ project: ProjectRecord; analysis: any }> {
  const res = await fetch(`/api/projects/${id}/analyze-source`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to analyze source story');
  }
  return data;
}

export async function fetchAnalysis(
  id: string
): Promise<{ success: boolean; currentAnalysis: any; analysisVersions: any[]; analysisStatus: string }> {
  const res = await fetch(`/api/projects/${id}/analysis`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch analysis');
  }
  return res.json();
}

export async function updateAnalysis(
  id: string,
  payload: { analysis: any }
): Promise<{ success: boolean; project: ProjectRecord; currentAnalysis: any }> {
  const res = await fetch(`/api/projects/${id}/skills/analysis`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update analysis');
  }
  return data;
}

export async function approveAnalysis(
  id: string
): Promise<{ success: boolean; project: ProjectRecord; currentAnalysis: any }> {
  const res = await fetch(`/api/projects/${id}/skills/analysis/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to approve analysis');
  }
  return data;
}

export async function regenerateAnalysis(
  id: string
): Promise<{ success: boolean; project: ProjectRecord; currentAnalysis: any }> {
  const res = await fetch(`/api/projects/${id}/skills/analysis/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to regenerate analysis');
  }
  return data;
}

export async function deleteProjectApi(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete project');
  }
}

export async function updateSourceStory(
  id: string,
  payload: {
    text: string;
    sourceType?: 'pasted_text' | 'file' | 'url';
    sourceReference?: string;
  }
): Promise<ProjectRecord> {
  const res = await fetch(`/api/projects/${id}/source`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save source story');
  }
  const data = await res.json();
  return data.project;
}

export async function extractUrlSource(
  id: string,
  url: string
): Promise<ProjectRecord> {
  const res = await fetch(`/api/projects/${id}/extract-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'URL extraction failed');
  }
  return data.project;
}

export async function restoreBackup(data: any): Promise<void> {
  const res = await fetch('/api/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to restore backup');
  }
}

export async function generateScript(
  id: string,
  options?: { targetDuration?: number; language?: 'Hindi' | 'English' }
): Promise<{ project: ProjectRecord; script: any }> {
  const res = await fetch(`/api/projects/${id}/skills/script/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate script');
  }
  return data;
}

export async function updateScript(
  id: string,
  payload: { parts: any[]; flaggedAmbiguities?: string[] }
): Promise<{ project: ProjectRecord; script: any }> {
  const res = await fetch(`/api/projects/${id}/skills/script`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update script');
  }
  return data;
}

export async function approveScript(
  id: string
): Promise<{ project: ProjectRecord; script: any }> {
  const res = await fetch(`/api/projects/${id}/skills/script/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to approve script');
  }
  return data;
}

