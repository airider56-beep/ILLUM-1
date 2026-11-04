export type MainView = 'dashboard' | 'projects' | 'create_project' | 'settings' | 'workspace';

export type WorkspaceTab = 
  | 'source'
  | 'script'
  | 'video_prompts'
  | 'thumbnail_prompts'
  | 'seo';

export type SeoSubTab = 'youtube' | 'instagram';

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
  selectedPartCount?: number; // 3, 4, 5, 6 for 9:16
  durationMinutes?: number; // >= 3 for 16:9
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

export type ProjectSummary = ProjectRecord;
