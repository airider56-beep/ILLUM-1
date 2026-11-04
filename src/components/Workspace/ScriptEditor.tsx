import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  History, 
  Globe, 
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  ListOrdered,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { ProjectRecord, ScriptPart } from '../../types/navigation';
import { generateScript, updateScript, approveScript, updateProject, analyzeSourceStory } from '../../services/api';

interface ScriptEditorProps {
  project: ProjectRecord;
  onProjectUpdated: (updated: ProjectRecord) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  project,
  onProjectUpdated,
}) => {
  const currentScript = project.currentScript;

  // Single Source of Truth: automatically read saved project settings
  const aspectRatio = project.aspectRatio;
  const language = project.language || 'English';
  
  // Calculate expected parts and total duration according to aspect ratio
  const is169 = aspectRatio === '16:9';
  const targetDurationSeconds = is169
    ? (project.duration || (project.durationMinutes ? Math.round(project.durationMinutes * 60) : 180))
    : (project.duration || (project.selectedPartCount ? project.selectedPartCount * 8 : 32));
  
  const expectedPartCount = is169
    ? (project.calculatedPartCount || Math.ceil(targetDurationSeconds / 8))
    : (project.selectedPartCount || Math.round(targetDurationSeconds / 8));

  const [parts, setParts] = useState<ScriptPart[]>(currentScript?.parts || []);
  const [flaggedAmbiguities, setFlaggedAmbiguities] = useState<string[]>(
    currentScript?.flaggedAmbiguities || []
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalysisReview, setShowAnalysisReview] = useState(true);

  // Missing settings resolution state (for existing legacy projects)
  const [isFixingSettings, setIsFixingSettings] = useState(false);

  // Sync state when active project's currentScript changes
  useEffect(() => {
    if (project.currentScript) {
      setParts(project.currentScript.parts || []);
      setFlaggedAmbiguities(project.currentScript.flaggedAmbiguities || []);
    } else {
      setParts([]);
      setFlaggedAmbiguities([]);
    }
    setFeedbackMessage(null);
    setErrorMessage(null);
  }, [project.id, project.currentScript?.id]);

  const hasSourceStory = Boolean(project.sourceStory?.text && project.sourceStory.text.trim().length > 0);
  const totalEstimatedDuration = parts.reduce((sum, p) => sum + (Number(p.estimatedDuration) || 0), 0);
  const analysis = project.sourceStory?.analysis || project.sourceAnalysis;

  // Trigger Gemini Skill 1 generation using saved project settings
  const handleGenerate = async () => {
    if (!aspectRatio) {
      setErrorMessage("Missing project setting: Aspect Ratio is required. Please select 9:16 or 16:9 below before generating.");
      return;
    }

    if (!hasSourceStory) {
      setErrorMessage('Original story source is required. Please add and save story material in Tab 1 first.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      // Skill 1 uses saved project settings directly (auto-runs source analysis if missing)
      const response = await generateScript(project.id);
      onProjectUpdated(response.project);
      setParts(response.script.parts);
      setFlaggedAmbiguities(response.script.flaggedAmbiguities || []);
      setFeedbackMessage(`Generated Script v${response.script.version} (${response.script.parts.length} dynamic parts).`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Script generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Source Analysis on demand
  const handleRunAnalysis = async () => {
    if (!hasSourceStory) {
      setErrorMessage('Please provide a source story in Tab 1 before analyzing.');
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const response = await analyzeSourceStory(project.id);
      onProjectUpdated(response.project);
      setFeedbackMessage('Source story analyzed successfully.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze source story.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Client-side language consistency validator for edits (Rule 3)
  const validatePartsLanguage = (partsToValidate: ScriptPart[], lang: 'Hindi' | 'English'): string | null => {
    for (const part of partsToValidate) {
      const text = (part.voiceover || '').trim();
      if (!text) continue;

      const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
      const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

      if (lang === 'Hindi') {
        if (devanagariCount === 0) {
          return `Part ${part.partNumber} (${part.partType}) must be written in Hindi Devanagari script.`;
        }
        const totalLetters = devanagariCount + latinCount;
        if (totalLetters > 0 && devanagariCount / totalLetters < 0.6) {
          return `Part ${part.partNumber} contains excessive English text. Narration must be natural Devanagari Hindi.`;
        }
        const consecutiveEnglishWords = /\b[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\b/;
        if (consecutiveEnglishWords.test(text)) {
          return `Part ${part.partNumber} contains mixed English phrases. English sentences are not permitted in Hindi narration.`;
        }
      } else if (lang === 'English') {
        if (devanagariCount > 0) {
          return `Part ${part.partNumber} (${part.partType}) contains Hindi Devanagari characters in an English script.`;
        }
      }
    }
    return null;
  };

  // Save edits to current script parts
  const handleSaveEdits = async () => {
    if (!currentScript) return;

    const validationError = validatePartsLanguage(parts, language);
    if (validationError) {
      setErrorMessage(`Language consistency violation: ${validationError}`);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const response = await updateScript(project.id, {
        parts,
        flaggedAmbiguities,
      });
      onProjectUpdated(response.project);
      setFeedbackMessage('Script edits saved successfully.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save script edits.');
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Script (Gatekeeper for Skills 2, 3, 4)
  const handleApprove = async () => {
    if (!currentScript) return;
    setIsApproving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const response = await approveScript(project.id);
      onProjectUpdated(response.project);
      setFeedbackMessage(`Script v${response.script.version} approved! Downstream Skills 2, 3, and 4 are now unlocked.`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve script.');
    } finally {
      setIsApproving(false);
    }
  };

  // Quick fix for missing aspect ratio on existing legacy projects
  const handleSetMissingAspectRatio = async (ratio: '9:16' | '16:9') => {
    try {
      setIsFixingSettings(true);
      const payload: any = { aspectRatio: ratio };
      if (ratio === '9:16') {
        payload.selectedPartCount = 4;
        payload.duration = 32;
      } else {
        payload.durationMinutes = 3;
        payload.duration = 180;
      }
      const updated = await updateProject(project.id, payload);
      onProjectUpdated(updated);
      setFeedbackMessage(`Project Aspect Ratio set to ${ratio} and saved.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update aspect ratio.');
    } finally {
      setIsFixingSettings(false);
    }
  };

  // Edit individual part field
  const handlePartChange = (index: number, field: keyof ScriptPart, value: any) => {
    setParts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Add new part
  const handleAddPart = () => {
    const newPartNumber = parts.length + 1;
    const newPart: ScriptPart = {
      partNumber: newPartNumber,
      partType: newPartNumber === 1 ? 'Hook' : 'Story',
      voiceover: '',
      estimatedDuration: 6,
    };
    setParts((prev) => {
      const updated = [...prev, newPart];
      return updated.map((p, idx) => ({
        ...p,
        partNumber: idx + 1,
        partType: idx === 0 ? 'Hook' : idx === updated.length - 1 ? 'Ending' : 'Story',
      }));
    });
  };

  // Remove part
  const handleRemovePart = (index: number) => {
    if (parts.length <= 2) {
      alert('A video script requires at least 2 parts (Hook and Ending).');
      return;
    }
    setParts((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((p, idx) => ({
        ...p,
        partNumber: idx + 1,
        partType: idx === 0 ? 'Hook' : idx === filtered.length - 1 ? 'Ending' : 'Story',
      }));
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback & Error Banners */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Notice:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Warning Banner if Aspect Ratio is Missing on Existing Project */}
      {!aspectRatio && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Missing Project Setting: Aspect Ratio</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This project does not have a saved Aspect Ratio. Per ILLYUM Phase 3 rules, an aspect ratio must be explicitly chosen rather than silently defaulted. Please select your aspect ratio below:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleSetMissingAspectRatio('9:16')}
              disabled={isFixingSettings}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Set 9:16 — Vertical (32s / 4 parts)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetMissingAspectRatio('16:9')}
              disabled={isFixingSettings}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Set 16:9 — Horizontal (3m / 23 parts)</span>
            </button>
          </div>
        </div>
      )}

      {/* Generation Parameters Card (Single Source of Truth) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Skill 1: Story-to-Script Generation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly grounded in your original Source Story with mandatory fact extraction, &le;8s per part, and no hallucinated events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {project.scriptVersions && project.scriptVersions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>History ({project.scriptVersions.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !hasSourceStory || !aspectRatio}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Analyzing & Generating...' : currentScript ? 'Regenerate Script' : 'Generate Script'}</span>
            </button>
          </div>
        </div>

        {/* Source check banner if story is missing */}
        {!hasSourceStory && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 flex items-center justify-between">
            <span>Original story source is empty. Please enter your story material in Tab 1 (Source Story) first.</span>
            <span className="font-semibold text-amber-400">Tab 1 Required</span>
          </div>
        )}

        {/* Single Source of Truth Display (Duplicate Selectors Removed per Rule 2) */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>Saved Project Settings (Single Source of Truth)</span>
            <span className="text-emerald-400 font-normal">• Read automatically</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Setting 1: Language */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Language</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  language === 'Hindi'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                }`}>
                  {language === 'Hindi' ? 'Devanagari Only' : 'English Only'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {language === 'Hindi' ? 'Hindi (हिंदी)' : 'English'}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'Hindi'
                  ? 'Complete script generated in Devanagari. No mixed English sentences.'
                  : 'Complete script generated in natural conversational English.'}
              </div>
            </div>

            {/* Setting 2: Target Duration & Formula */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Duration System</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {expectedPartCount} Parts Target
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {is169 
                  ? `${project.durationMinutes || Math.round(targetDurationSeconds / 60)} Minutes (${targetDurationSeconds}s)`
                  : `${targetDurationSeconds} Seconds (${expectedPartCount} Parts)`}
              </div>
              <div className="text-[11px] text-slate-500">
                {is169
                  ? `Formula: Ceiling(${targetDurationSeconds}s ÷ 8) = ${expectedPartCount} parts`
                  : `Formula: ${expectedPartCount} parts × 8s = ${targetDurationSeconds}s`}
              </div>
            </div>

            {/* Setting 3: Aspect Ratio */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  {aspectRatio === '16:9' ? (
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>Aspect Ratio</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Skills 2 & 3 Ready
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {aspectRatio ? (
                  aspectRatio === '9:16' ? '9:16 — Vertical' : '16:9 — Horizontal'
                ) : (
                  <span className="text-amber-400 font-normal text-xs">Not configured</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                {aspectRatio === '9:16'
                  ? 'YouTube Shorts / Instagram Reels'
                  : aspectRatio === '16:9'
                  ? 'YouTube Landscape (Min 3m)'
                  : 'Please set aspect ratio above'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Drawer (if opened) */}
      {showVersionHistory && project.scriptVersions && project.scriptVersions.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Prior Script Versions</span>
            </span>
            <span className="text-slate-400">{project.scriptVersions.length} archived</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {project.scriptVersions.map((v, i) => (
              <div
                key={v.id || i}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Version {v.version}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    v.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {v.approvalStatus}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>{v.parts?.length || 0} parts</span>
                  <span>{v.totalEstimatedDuration}s total</span>
                  <span className="font-semibold text-slate-300">{v.language}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Hook: "{v.parts?.[0]?.voiceover || 'N/A'}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MANDATORY SOURCE ANALYSIS REVIEW SECTION (Prompt Section 1) */}
      {analysis ? (
        <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl overflow-hidden shadow-lg shadow-indigo-950/20">
          <button
            type="button"
            onClick={() => setShowAnalysisReview(!showAnalysisReview)}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-indigo-950/20 hover:bg-indigo-950/30 transition-colors border-b border-indigo-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Source Analysis Review (Grounding Verification)</span>
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    No Hallucinations Allowed
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspect extracted facts, chronology, and flagged gaps before script approval.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs hidden sm:inline">{showAnalysisReview ? 'Collapse' : 'Expand Review'}</span>
              {showAnalysisReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAnalysisReview && (
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject & Characters */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Main Subject & Characters</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {analysis.mainSubjectAndCharacters?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Locations and Dates */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Locations & Dates</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {analysis.locationsAndDates?.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>

                {/* Extracted Facts */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Key Facts (Script Grounding Basis)</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {analysis.keyFacts?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Chronology & Events */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Chronological Sequence</span>
                  </span>
                  <ol className="space-y-1 text-slate-300 list-decimal list-inside">
                    {analysis.chronology?.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Narrative Arc */}
              {analysis.narrativeArc && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">
                    Narrative Arc Flow
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Beginning / Hook</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{analysis.narrativeArc.beginning}</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">Middle / Story Arc</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{analysis.narrativeArc.middle}</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Ending / Climax</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{analysis.narrativeArc.ending}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Missing or Ambiguous Information */}
              {analysis.missingOrAmbiguous && analysis.missingOrAmbiguous.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Missing or Ambiguous Information Flagged</span>
                  </div>
                  <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                    {analysis.missingOrAmbiguous.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : hasSourceStory ? (
        /* Prompt user to inspect analysis if not yet run */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Source Story Analysis Pending</span>
              <span className="text-slate-400">Run mandatory source analysis before generating or approving scripts.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing Story...' : 'Analyze Source Now'}</span>
          </button>
        </div>
      ) : null}

      {/* Generated Script Workspace (when script exists) */}
      {currentScript ? (
        <div className="space-y-6">
          {/* Approval Banner */}
          <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            currentScript.approvalStatus === 'Approved'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  currentScript.approvalStatus === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  Status: {currentScript.approvalStatus}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Script Version {currentScript.version}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentScript.approvalStatus === 'Approved'
                  ? `Script was approved on ${new Date(currentScript.approvedAt || currentScript.updatedAt).toLocaleTimeString()}. Downstream Skills 2, 3, and 4 are unlocked.`
                  : 'Review the source-grounded voiceover parts below. Once you inspect and approve, downstream Skills 2, 3, and 4 will be unlocked.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSaveEdits}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSaving ? 'Saving...' : 'Save Edits'}</span>
              </button>

              {currentScript.approvalStatus !== 'Approved' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isApproving ? 'Approving...' : 'Approve Script'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Flagged Ambiguities Card (Test B7: no fabricated facts) */}
          {flaggedAmbiguities && flaggedAmbiguities.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Flagged Source Gaps / Ambiguities (Rule FR-03 & Test B7)</span>
              </div>
              <p className="text-xs text-slate-300">
                The model identified missing or incomplete facts in the original story. Per strict ILLYUM rules, no false facts were fabricated.
              </p>
              <ul className="space-y-1 pt-1 text-xs text-amber-200/90 list-disc list-inside">
                {flaggedAmbiguities.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Script Overview Metadata */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                Parts Count: <strong className="text-indigo-400">{parts.length}</strong> (Target: {expectedPartCount})
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                Total Estimated Duration: <strong className="text-emerald-400">{totalEstimatedDuration}s</strong> (Target: {currentScript.targetDuration}s)
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                Language: <strong className="text-slate-200">{currentScript.language}</strong>
              </span>
              {currentScript.modelUsed && (
                <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Engine: {currentScript.modelUsed}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddPart}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Part</span>
            </button>
          </div>

          {/* Ordered Script Parts */}
          <div className="space-y-4">
            {parts.map((part, index) => {
              const isHook = part.partType === 'Hook';
              const isEnding = part.partType === 'Ending';

              return (
                <div
                  key={index}
                  className={`bg-slate-900/70 border rounded-2xl p-5 space-y-3 transition-all ${
                    isHook
                      ? 'border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                      : isEnding
                      ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                        {part.partNumber}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isHook
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : isEnding
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}>
                        Part {part.partNumber}: {part.partType}
                      </span>
                      {isHook && (
                        <span className="text-[11px] text-indigo-400 font-medium hidden sm:inline">
                          (Curiosity Hook &rarr; Becomes YouTube Title in Skill 4)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Duration control */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Est:</span>
                        <input
                          type="number"
                          min={2}
                          max={8}
                          value={part.estimatedDuration}
                          onChange={(e) =>
                            handlePartChange(index, 'estimatedDuration', Math.min(8, Math.max(1, Number(e.target.value))))
                          }
                          className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <span>sec (max 8s)</span>
                      </div>

                      {/* Remove part button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Remove Part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Voiceover textarea */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Voiceover Narration ({language})</span>
                      {language === 'Hindi' && (
                        <span className="text-[10px] text-amber-400 font-normal">Strict Devanagari Hindi</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={part.voiceover}
                      onChange={(e) => handlePartChange(index, 'voiceover', e.target.value)}
                      placeholder={`Enter voiceover text for ${part.partType} part in ${language}...`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed font-sans"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty Script State before Generation */
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-200">No Script Generated Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong className="text-indigo-400">"Generate Script"</strong> above to analyze your saved story source and generate {expectedPartCount} duration-controlled voiceover parts (&le;8s each) with Part 1 Hook, narrative Story, and final Ending in <strong className="text-slate-200">{language}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
