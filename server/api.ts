import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  saveProject, 
  deleteProject, 
  getRawDbContent, 
  restoreDbContent, 
  ProjectRecord,
  ScriptRecord,
  AnalysisRecord,
  computeSourceFingerprint
} from './db';
import { 
  generateSkill1Script, 
  validateLanguageConsistency, 
  calculatePartDistribution 
} from './skill1';
import { analyzeSourceStory } from './sourceAnalysis';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ILLYUM',
    phase: 3,
    timestamp: new Date().toISOString(),
    persistence: 'server-side filesystem JSON repository (/data/projects.json)',
  });
});

// List all projects
apiRouter.get('/projects', (req, res) => {
  try {
    const projects = getAllProjects();
    res.json({ success: true, projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single project by ID
apiRouter.get('/projects/:id', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new project with Aspect Ratio-based duration formula (Requirements 2, 3, 4, 5)
apiRouter.post('/projects', (req, res) => {
  try {
    const { 
      name, 
      language = 'English', 
      aspectRatio = '9:16',
      selectedPartCount,
      durationMinutes,
      duration
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }

    if (aspectRatio !== '9:16' && aspectRatio !== '16:9') {
      return res.status(400).json({
        success: false,
        error: "Aspect ratio is required and must be either '9:16' (Vertical) or '16:9' (Horizontal)",
      });
    }

    if (language !== 'Hindi' && language !== 'English') {
      return res.status(400).json({
        success: false,
        error: "Language is required and must be either 'Hindi' or 'English'",
      });
    }

    let durationMode: 'parts' | 'minutes';
    let targetDurationSeconds: number;
    let partsCount: number;
    let chosenPartCount: number | undefined;
    let chosenMinutes: number | undefined;

    if (aspectRatio === '9:16') {
      durationMode = 'parts';
      chosenPartCount = Number(selectedPartCount);
      if (![3, 4, 5, 6].includes(chosenPartCount)) {
        // Fallback calculation if part count wasn't provided directly
        if (duration && [24, 32, 40, 48].includes(Number(duration))) {
          chosenPartCount = Number(duration) / 8;
        } else {
          chosenPartCount = 3;
        }
      }
      targetDurationSeconds = chosenPartCount * 8;
      partsCount = chosenPartCount;
    } else {
      // 16:9 Horizontal Landscape: Minimum 3 minutes
      durationMode = 'minutes';
      chosenMinutes = Number(durationMinutes);
      if (!chosenMinutes && duration) {
        chosenMinutes = Math.max(3, Math.round(Number(duration) / 60));
      }
      if (!chosenMinutes || chosenMinutes < 3) {
        return res.status(400).json({
          success: false,
          error: 'Minimum video duration for 16:9 Aspect Ratio is 3 minutes (180 seconds).',
        });
      }
      targetDurationSeconds = Math.round(chosenMinutes * 60);
      partsCount = Math.ceil(targetDurationSeconds / 8);
    }

    const newProject: ProjectRecord = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      status: 'Draft',
      duration: targetDurationSeconds,
      targetDurationSeconds,
      durationMode,
      selectedPartCount: chosenPartCount,
      durationMinutes: chosenMinutes,
      calculatedPartCount: partsCount,
      language,
      aspectRatio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceStory: {
        text: '',
        sourceType: 'pasted_text',
        charCount: 0,
        wordCount: 0,
        extractionStatus: 'empty',
        updatedAt: new Date().toISOString(),
      },
    };

    const saved = saveProject(newProject);
    res.status(201).json({ success: true, project: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update project settings
apiRouter.put('/projects/:id', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { 
      name, 
      aspectRatio, 
      language, 
      selectedPartCount, 
      durationMinutes, 
      duration, 
      status 
    } = req.body;

    if (name && typeof name === 'string' && name.trim()) {
      project.name = name.trim();
    }

    if (aspectRatio === '9:16' || aspectRatio === '16:9') {
      project.aspectRatio = aspectRatio;
    }

    if (language === 'Hindi' || language === 'English') {
      project.language = language;
    }

    if (project.aspectRatio === '9:16') {
      if (selectedPartCount && [3, 4, 5, 6].includes(Number(selectedPartCount))) {
        project.selectedPartCount = Number(selectedPartCount);
        project.durationMode = 'parts';
        project.targetDurationSeconds = project.selectedPartCount * 8;
        project.calculatedPartCount = project.selectedPartCount;
        project.duration = project.targetDurationSeconds;
      }
    } else if (project.aspectRatio === '16:9') {
      if (durationMinutes && Number(durationMinutes) >= 3) {
        project.durationMinutes = Number(durationMinutes);
        project.durationMode = 'minutes';
        project.targetDurationSeconds = Math.round(project.durationMinutes * 60);
        project.calculatedPartCount = Math.ceil(project.targetDurationSeconds / 8);
        project.duration = project.targetDurationSeconds;
      }
    }

    if (typeof duration === 'number' && duration > 0 && !project.targetDurationSeconds) {
      project.duration = duration;
      project.targetDurationSeconds = duration;
    }

    if (status) {
      project.status = status;
    }

    const saved = saveProject(project);
    res.json({ success: true, project: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete project
apiRouter.delete('/projects/:id', (req, res) => {
  try {
    const deleted = deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update source story for project
apiRouter.put('/projects/:id/source', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { text = '', sourceType = 'pasted_text', sourceReference } = req.body;
    const cleanText = typeof text === 'string' ? text.trim() : '';
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;

    const previousText = project.sourceStory?.text || '';
    const textChanged = cleanText !== previousText;
    const sourceVersion = (project.sourceStory?.version || 1) + (previousText && textChanged ? 1 : 0);
    const sourceFingerprint = computeSourceFingerprint(cleanText);

    // If source story text changed, previous analysis becomes Stale and cannot be treated as approved
    if (previousText && textChanged && project.currentAnalysis) {
      project.currentAnalysis.status = 'Stale';
      project.currentAnalysis.approvedAt = undefined;
      project.analysisStatus = 'Analysis Stale';
    }

    project.sourceStory = {
      text: cleanText,
      sourceType: ['pasted_text', 'file', 'url'].includes(sourceType) ? sourceType : 'pasted_text',
      charCount: chars,
      wordCount: words,
      extractionStatus: chars > 0 ? 'success' : 'empty',
      sourceReference: sourceReference || undefined,
      version: sourceVersion,
      fingerprint: sourceFingerprint,
      analysis: textChanged ? undefined : project.sourceStory?.analysis,
      updatedAt: new Date().toISOString(),
    };

    if (textChanged) {
      project.sourceAnalysis = undefined;
    }

    if (chars > 0 && project.status === 'Draft') {
      project.status = 'Source Ready';
    } else if (chars === 0 && project.status === 'Source Ready') {
      project.status = 'Draft';
    }

    const saved = saveProject(project);
    res.json({ success: true, project: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// URL source extraction helper (FR-02 & Test A4)
apiRouter.post('/projects/:id/extract-url', async (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid URL starting with http:// or https://',
      });
    }

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ILLYUM Content Studio Research Bot/1.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`Remote server responded with HTTP status ${response.status}`);
      }

      const html = await response.text();
      const stripped = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (stripped.length < 50) {
        throw new Error('Content extraction returned insufficient readable text. Web page may require JavaScript or authentication.');
      }

      const extractedContent = stripped.slice(0, 10000);
      const words = extractedContent.split(/\s+/).filter(Boolean).length;

      const previousText = project.sourceStory?.text || '';
      const textChanged = extractedContent !== previousText;
      const sourceVersion = (project.sourceStory?.version || 1) + (previousText && textChanged ? 1 : 0);
      const sourceFingerprint = computeSourceFingerprint(extractedContent);

      if (previousText && textChanged && project.currentAnalysis) {
        project.currentAnalysis.status = 'Stale';
        project.currentAnalysis.approvedAt = undefined;
        project.analysisStatus = 'Analysis Stale';
      }

      project.sourceStory = {
        text: extractedContent,
        sourceType: 'url',
        sourceReference: url,
        charCount: extractedContent.length,
        wordCount: words,
        extractionStatus: 'success',
        version: sourceVersion,
        fingerprint: sourceFingerprint,
        analysis: textChanged ? undefined : project.sourceStory?.analysis,
        updatedAt: new Date().toISOString(),
      };
      if (textChanged) {
        project.sourceAnalysis = undefined;
      }
      if (project.status === 'Draft') {
        project.status = 'Source Ready';
      }

      const saved = saveProject(project);
      res.json({ success: true, project: saved, extractedWordCount: words });
    } catch (fetchErr: any) {
      project.sourceStory.extractionStatus = 'failed';
      project.sourceStory.errorMessage = `URL extraction failed (${fetchErr.message}). Please copy and paste the story text directly.`;
      project.sourceStory.sourceReference = url;
      saveProject(project);

      return res.status(422).json({
        success: false,
        error: `Could not access or extract story from URL: ${fetchErr.message}. Please paste the story text directly into the text area.`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================
// SKILL 0: SOURCE STORY ANALYSIS ENDPOINTS (PHASE 1)
// ==============================================================

// Generate initial or updated Source Analysis (Skill 0)
apiRouter.post('/projects/:id/analyze-source', async (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.sourceStory || !project.sourceStory.text || !project.sourceStory.text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot analyze empty source story. Please supply story text in Tab 1 first.',
      });
    }

    const sourceText = project.sourceStory.text.trim();
    const fingerprint = computeSourceFingerprint(sourceText);
    const sourceVersion = project.sourceStory.version || 1;
    project.sourceStory.fingerprint = fingerprint;
    project.sourceStory.version = sourceVersion;

    const extracted = await analyzeSourceStory(sourceText);

    // Versioning history: archive previous currentAnalysis
    const previousVersions = project.analysisVersions || [];
    if (project.currentAnalysis) {
      previousVersions.unshift({ ...project.currentAnalysis });
    }
    const allVersions = [
      ...previousVersions.map((v) => v.version),
      ...(project.currentAnalysis ? [project.currentAnalysis.version] : []),
    ];
    const nextVersion = (allVersions.length > 0 ? Math.max(...allVersions) : 0) + 1;

    const newAnalysisRecord: AnalysisRecord = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      version: nextVersion,
      sourceVersion,
      sourceFingerprint: fingerprint,
      analysis: extracted,
      status: 'Needs Review', // Mandatory: Never automatically approved
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelUsed: extracted.modelUsed,
    };

    project.analysisVersions = previousVersions;
    project.currentAnalysis = newAnalysisRecord;
    project.analysisStatus = 'Analysis Needs Review';

    // Backward compatibility sync
    project.sourceAnalysis = extracted;
    project.sourceStory.analysis = extracted;

    const saved = saveProject(project);
    res.json({ success: true, project: saved, analysis: newAnalysisRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET current analysis and version history
apiRouter.get('/projects/:id/analysis', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({
      success: true,
      currentAnalysis: project.currentAnalysis || null,
      analysisVersions: project.analysisVersions || [],
      analysisStatus: project.analysisStatus || 'Analysis Pending',
      sourceAnalysis: project.sourceAnalysis || null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT save user edits to current analysis (Requires approval again)
apiRouter.put('/projects/:id/skills/analysis', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.currentAnalysis) {
      return res.status(400).json({
        success: false,
        error: 'No active analysis found to edit. Please run analysis first.',
      });
    }

    const { analysis } = req.body;
    if (!analysis || typeof analysis !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Updated analysis payload must be an object with analysis dimensions.',
      });
    }

    // Merge edited fields into current analysis
    project.currentAnalysis.analysis = {
      ...project.currentAnalysis.analysis,
      ...analysis,
    };
    project.currentAnalysis.updatedAt = new Date().toISOString();

    // Mandatory Rule: An edited analysis must require approval again
    project.currentAnalysis.status = 'Needs Review';
    project.currentAnalysis.approvedAt = undefined;
    project.analysisStatus = 'Analysis Needs Review';

    // Backward compatibility sync
    project.sourceAnalysis = project.currentAnalysis.analysis;
    if (project.sourceStory) {
      project.sourceStory.analysis = project.currentAnalysis.analysis;
    }

    const saved = saveProject(project);
    res.json({ success: true, project: saved, currentAnalysis: project.currentAnalysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST approve current analysis version
apiRouter.post('/projects/:id/skills/analysis/approve', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.currentAnalysis) {
      return res.status(400).json({
        success: false,
        error: 'No active analysis available to approve. Please generate analysis first.',
      });
    }

    // Verification: Verify that analysis belongs to current source version
    const currentSourceText = project.sourceStory?.text || '';
    const currentFingerprint = computeSourceFingerprint(currentSourceText);

    if (
      project.currentAnalysis.sourceFingerprint &&
      project.currentAnalysis.sourceFingerprint !== currentFingerprint
    ) {
      project.currentAnalysis.status = 'Stale';
      project.currentAnalysis.approvedAt = undefined;
      project.analysisStatus = 'Analysis Stale';
      saveProject(project);

      return res.status(400).json({
        success: false,
        error: 'Cannot approve analysis: Source story has changed since this analysis was generated. Please regenerate analysis for the current source.',
      });
    }

    project.currentAnalysis.status = 'Approved';
    project.currentAnalysis.approvedAt = new Date().toISOString();
    project.currentAnalysis.updatedAt = new Date().toISOString();
    project.analysisStatus = 'Analysis Approved';

    const saved = saveProject(project);
    res.json({ success: true, project: saved, currentAnalysis: project.currentAnalysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST regenerate new analysis version (preserves older versions)
apiRouter.post('/projects/:id/skills/analysis/regenerate', async (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.sourceStory || !project.sourceStory.text || !project.sourceStory.text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot regenerate analysis without source story text. Please provide story in Tab 1 first.',
      });
    }

    const sourceText = project.sourceStory.text.trim();
    const fingerprint = computeSourceFingerprint(sourceText);
    const sourceVersion = project.sourceStory.version || 1;
    project.sourceStory.fingerprint = fingerprint;

    const extracted = await analyzeSourceStory(sourceText);

    // Preserve previous version in history
    const previousVersions = project.analysisVersions || [];
    if (project.currentAnalysis) {
      previousVersions.unshift({ ...project.currentAnalysis });
    }
    const allVersions = [
      ...previousVersions.map((v) => v.version),
      ...(project.currentAnalysis ? [project.currentAnalysis.version] : []),
    ];
    const nextVersion = (allVersions.length > 0 ? Math.max(...allVersions) : 0) + 1;

    const newAnalysisRecord: AnalysisRecord = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      version: nextVersion,
      sourceVersion,
      sourceFingerprint: fingerprint,
      analysis: extracted,
      status: 'Needs Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelUsed: extracted.modelUsed,
    };

    project.analysisVersions = previousVersions;
    project.currentAnalysis = newAnalysisRecord;
    project.analysisStatus = 'Analysis Needs Review';

    // Backward compatibility
    project.sourceAnalysis = extracted;
    project.sourceStory.analysis = extracted;

    const saved = saveProject(project);
    res.json({ success: true, project: saved, currentAnalysis: newAnalysisRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==============================================================
// SKILL 1: STORY-TO-SCRIPT ROUTES (PHASE 3)
// ==============================================================

// Generate Skill 1 script from source story (Single Source of Truth + Grounded Source Analysis)
apiRouter.post('/projects/:id/skills/script/generate', async (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Existing project compatibility: require all 3 mandatory settings
    if (!project.aspectRatio) {
      return res.status(400).json({
        success: false,
        error: "Project setting 'aspectRatio' is missing. Please select 9:16 (Vertical) or 16:9 (Horizontal) in project settings before generating a script.",
      });
    }

    if (!project.language || (project.language !== 'Hindi' && project.language !== 'English')) {
      return res.status(400).json({
        success: false,
        error: "Project setting 'language' is missing. Please select Hindi or English in project settings before generating a script.",
      });
    }

    const targetDurationSeconds = project.targetDurationSeconds || project.duration;
    if (!targetDurationSeconds || targetDurationSeconds <= 0) {
      return res.status(400).json({
        success: false,
        error: "Project setting 'duration' is missing. Please configure video duration in project settings before generating a script.",
      });
    }

    if (project.aspectRatio === '16:9' && targetDurationSeconds < 180) {
      return res.status(400).json({
        success: false,
        error: 'Minimum video duration for 16:9 Aspect Ratio is 3 minutes (180 seconds).',
      });
    }

    if (!project.sourceStory || !project.sourceStory.text || !project.sourceStory.text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot generate script without original source story. Please add and save story material in Tab 1 first.',
      });
    }

    // Step 1: Ensure Source Analysis exists before script generation
    let analysis = project.sourceAnalysis;
    if (!analysis) {
      analysis = await analyzeSourceStory(project.sourceStory.text);
      project.sourceAnalysis = analysis;
      project.sourceStory.analysis = analysis;
    }

    // Step 2: Call Skill 1 engine strictly grounded in sourceAnalysis
    const result = await generateSkill1Script({
      sourceText: project.sourceStory.text,
      aspectRatio: project.aspectRatio,
      targetDurationSeconds,
      selectedPartCount: project.selectedPartCount,
      language: project.language,
      existingAnalysis: analysis,
    });

    // Versioning management: preserve previous currentScript in scriptVersions array
    const previousVersions = project.scriptVersions || [];
    if (project.currentScript) {
      previousVersions.unshift({ ...project.currentScript });
    }
    const nextVersionNumber = (previousVersions.length > 0 ? Math.max(...previousVersions.map(v => v.version)) : 0) + 1;

    const newScript: ScriptRecord = {
      id: `script-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      version: nextVersionNumber,
      language: project.language,
      targetDuration: targetDurationSeconds,
      totalEstimatedDuration: result.totalEstimatedDuration,
      parts: result.parts,
      flaggedAmbiguities: result.flaggedAmbiguities,
      approvalStatus: 'Needs Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelUsed: result.modelUsed,
    };

    project.currentScript = newScript;
    project.scriptVersions = previousVersions;
    project.status = 'Script Needs Review';

    const saved = saveProject(project);
    res.json({ success: true, project: saved, script: newScript, sourceAnalysis: result.sourceAnalysis });
  } catch (err: any) {
    console.error('Skill 1 generation error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Script generation failed. Please check network/API status and retry.' 
    });
  }
});

// Update/Edit existing script parts
apiRouter.put('/projects/:id/skills/script', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.currentScript) {
      return res.status(400).json({ success: false, error: 'No active script exists for this project' });
    }

    const { parts, flaggedAmbiguities } = req.body;
    if (!Array.isArray(parts)) {
      return res.status(400).json({ success: false, error: 'Parts array is required' });
    }

    // Validate parts: enforce maximum 8 seconds per part (FR-03, Test B4)
    const updatedParts = parts.map((p: any, idx: number) => ({
      partNumber: idx + 1,
      partType: idx === 0 ? 'Hook' : idx === parts.length - 1 ? 'Ending' : 'Story',
      voiceover: String(p.voiceover || '').trim(),
      estimatedDuration: Math.min(8, Math.max(1, Number(p.estimatedDuration) || 8)),
    }));

    // Enforce language consistency on manual edits (Rule 3)
    const validation = validateLanguageConsistency(updatedParts, project.language);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Language consistency error: ${validation.error}`,
      });
    }

    const totalEstimatedDuration = updatedParts.reduce((sum: number, p: any) => sum + p.estimatedDuration, 0);

    project.currentScript.parts = updatedParts;
    project.currentScript.totalEstimatedDuration = totalEstimatedDuration;
    if (Array.isArray(flaggedAmbiguities)) {
      project.currentScript.flaggedAmbiguities = flaggedAmbiguities;
    }
    project.currentScript.updatedAt = new Date().toISOString();
    
    // If it was approved and now edited, reset to Needs Review
    if (project.currentScript.approvalStatus === 'Approved') {
      project.currentScript.approvalStatus = 'Needs Review';
      project.status = 'Script Needs Review';
    }

    const saved = saveProject(project);
    res.json({ success: true, project: saved, script: project.currentScript });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve script
apiRouter.post('/projects/:id/skills/script/approve', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (!project.currentScript) {
      return res.status(400).json({ success: false, error: 'No script available to approve' });
    }

    project.currentScript.approvalStatus = 'Approved';
    project.currentScript.approvedAt = new Date().toISOString();
    project.currentScript.updatedAt = new Date().toISOString();
    project.status = 'Script Approved';

    const saved = saveProject(project);
    res.json({ success: true, project: saved, script: project.currentScript });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Database 1-Click Backup (Returns complete JSON)
apiRouter.get('/backup', (req, res) => {
  try {
    const raw = getRawDbContent();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="illyum-backup-${Date.now()}.json"`);
    res.send(raw);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Database Restore from JSON
apiRouter.post('/restore', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Backup data is required' });
    }
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    const ok = restoreDbContent(jsonStr);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Invalid backup format' });
    }
    res.json({ success: true, message: 'Database successfully restored from backup' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
