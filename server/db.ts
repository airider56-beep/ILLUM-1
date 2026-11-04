import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function computeSourceFingerprint(text: string): string {
  return crypto.createHash('sha256').update((text || '').trim()).digest('hex').substring(0, 16);
}

export type AnalysisStatus = 'Draft' | 'Needs Review' | 'Approved' | 'Stale';

export interface AnalysisRecord {
  id: string;
  version: number;
  sourceVersion: number;
  sourceFingerprint: string;
  analysis: SourceAnalysis;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  modelUsed?: string;
}

export interface SourceAnalysis {
  mainSubjectAndCharacters: string[];
  keyFacts: string[];
  chronology: string[];
  locationsAndDates: string[];
  keyDevelopments: string[];
  narrativeArc: {
    beginning: string;
    middle: string;
    ending: string;
  };
  missingOrAmbiguous: string[];
  analyzedAt: string;
  sourceWordCount: number;
  modelUsed?: string;
}

export interface SourceStory {
  text: string;
  sourceType: 'pasted_text' | 'file' | 'url';
  charCount: number;
  wordCount: number;
  extractionStatus: 'success' | 'failed' | 'empty';
  sourceReference?: string;
  errorMessage?: string;
  version?: number;
  fingerprint?: string;
  analysis?: SourceAnalysis;
  updatedAt: string;
}

export interface ScriptPart {
  partNumber: number;
  partType: 'Hook' | 'Story' | 'Ending';
  voiceover: string;
  estimatedDuration: number;
}

export interface ScriptRecord {
  id: string;
  version: number;
  language: 'Hindi' | 'English';
  targetDuration: number;
  totalEstimatedDuration: number;
  parts: ScriptPart[];
  flaggedAmbiguities?: string[];
  approvalStatus: 'Draft' | 'Needs Review' | 'Approved' | 'Stale';
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  modelUsed?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  status: 'Draft' | 'Source Ready' | 'Script In Progress' | 'Script Needs Review' | 'Script Approved' | 'Complete';
  duration: number; // targetDurationSeconds
  language: 'Hindi' | 'English';
  aspectRatio?: '9:16' | '16:9';
  durationMode?: 'parts' | 'minutes';
  targetDurationSeconds?: number;
  selectedPartCount?: number;
  durationMinutes?: number;
  calculatedPartCount?: number;
  sourceStory: SourceStory;
  sourceAnalysis?: SourceAnalysis; // backward compatibility
  currentAnalysis?: AnalysisRecord; // Skill 0
  analysisVersions?: AnalysisRecord[]; // Skill 0 version history
  analysisStatus?: 'Analysis Pending' | 'Analysis Needs Review' | 'Analysis Approved' | 'Analysis Stale';
  currentScript?: ScriptRecord;
  scriptVersions?: ScriptRecord[];
  videoPrompts?: any[];
  thumbnailPrompts?: any[];
  seoResults?: any;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists.
// Per Phase 3 corrections (Requirement 9): Stop automatically creating unnecessary dummy projects.
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // Initialize clean empty array for real user projects
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllProjects(): ProjectRecord[] {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const projects: ProjectRecord[] = JSON.parse(raw);
    
    // Clearly distinguish legacy demo records from genuine user projects (Requirement 9)
    return projects.map((p) => {
      if (p.id.startsWith('proj-demo-')) {
        return { ...p, isDemo: true };
      }
      return p;
    });
  } catch (err) {
    console.error('Error reading projects DB:', err);
    return [];
  }
}

export function getProjectById(id: string): ProjectRecord | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: ProjectRecord): ProjectRecord {
  ensureDb();
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  
  project.updatedAt = new Date().toISOString();
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  
  fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  return project;
}

export function deleteProject(id: string): boolean {
  ensureDb();
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length !== projects.length) {
    fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function getRawDbContent(): string {
  ensureDb();
  return fs.readFileSync(DB_FILE, 'utf-8');
}

export function restoreDbContent(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Backup data must be an array of projects');
    }
    ensureDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to restore database:', err);
    return false;
  }
}
