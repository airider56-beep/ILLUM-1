import React, { useState } from 'react';
import { Sparkles, Clock, Globe, ArrowRight, ShieldAlert, Smartphone, Monitor, Info, CheckCircle2 } from 'lucide-react';

interface CreateProjectViewProps {
  onCreateProject: (project: {
    name: string;
    aspectRatio: '9:16' | '16:9';
    language: 'Hindi' | 'English';
    selectedPartCount?: number;
    durationMinutes?: number;
    duration?: number;
  }) => void;
  onCancel: () => void;
}

export const CreateProjectView: React.FC<CreateProjectViewProps> = ({
  onCreateProject,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [language, setLanguage] = useState<'Hindi' | 'English'>('English');
  
  // 9:16 Duration: Part counts (3, 4, 5, 6)
  const [selectedPartCount, setSelectedPartCount] = useState<3 | 4 | 5 | 6>(4);
  
  // 16:9 Duration: Minutes (minimum 3)
  const [durationMinutes, setDurationMinutes] = useState<number>(3);
  
  const [error, setError] = useState('');

  // 16:9 Calculations
  const calculatedSeconds169 = Math.round(durationMinutes * 60);
  const calculatedParts169 = Math.ceil(calculatedSeconds169 / 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }

    if (aspectRatio !== '9:16' && aspectRatio !== '16:9') {
      setError('Please select an Aspect Ratio (9:16 or 16:9).');
      return;
    }

    if (language !== 'Hindi' && language !== 'English') {
      setError('Please select a Language (Hindi or English).');
      return;
    }

    if (aspectRatio === '9:16') {
      if (![3, 4, 5, 6].includes(selectedPartCount)) {
        setError('Please select a valid part count for 9:16 (3, 4, 5, or 6 parts).');
        return;
      }
      const totalSec = selectedPartCount * 8;
      onCreateProject({
        name: name.trim(),
        aspectRatio,
        language,
        selectedPartCount,
        duration: totalSec,
      });
    } else {
      // 16:9 Aspect Ratio
      if (typeof durationMinutes !== 'number' || isNaN(durationMinutes) || durationMinutes < 3) {
        setError('Minimum video duration for 16:9 is 3 minutes. Please enter 3 minutes or more.');
        return;
      }
      onCreateProject({
        name: name.trim(),
        aspectRatio,
        language,
        durationMinutes,
        duration: calculatedSeconds169,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Content Workspace</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Create New Project</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure the three mandatory project settings. These define your single source of truth across all skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Project Name */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Project Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Mysteries of the Mariana Trench"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
          <p className="text-[11px] text-slate-400">
            A descriptive title to easily identify your story workspace.
          </p>
        </div>

        {/* Setting A: Aspect Ratio (Mandatory: Exactly 2 options) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>A. Aspect Ratio (Mandatory)</span>
            </span>
            <span className="text-indigo-400 text-[11px] font-normal">Controls duration formula</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setAspectRatio('9:16');
                setError('');
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <Smartphone className={`w-4 h-4 ${aspectRatio === '9:16' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-bold text-sm text-slate-100">9:16 — Vertical</span>
              </div>
              <div className="text-[11px] text-slate-400">
                YouTube Shorts / Instagram Reels (8s Part Formula)
              </div>
              {aspectRatio === '9:16' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAspectRatio('16:9');
                setError('');
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <Monitor className={`w-4 h-4 ${aspectRatio === '16:9' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-bold text-sm text-slate-100">16:9 — Horizontal</span>
              </div>
              <div className="text-[11px] text-slate-400">
                YouTube Landscape (Min 3 Minutes, Ceiling 8s Parts)
              </div>
              {aspectRatio === '16:9' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Setting B: Language (Mandatory: Exactly 2 options) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>B. Language (Mandatory)</span>
            </span>
            <span className="text-indigo-400 text-[11px] font-normal">Strict consistency enforced</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('Hindi')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                language === 'Hindi'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-slate-100 mb-0.5">Hindi (हिंदी)</div>
              <div className="text-[11px] text-slate-400">Natural Devanagari voiceover narration</div>
              {language === 'Hindi' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('English')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                language === 'English'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-slate-100 mb-0.5">English</div>
              <div className="text-[11px] text-slate-400">Clear conversational English voiceover</div>
              {language === 'English' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Setting C: Target Duration — Dynamic depending on Aspect Ratio */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>C. Target Video Duration (8-Second Formula)</span>
            </span>
            <span className="text-indigo-400 text-[11px] font-normal">
              {aspectRatio === '9:16' ? 'Formula: Parts × 8s' : 'Formula: Ceiling(Seconds ÷ 8)'}
            </span>
          </label>

          {aspectRatio === '9:16' ? (
            /* 9:16 Duration UI: Part counts and total seconds */
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { parts: 3 as const, sec: 24, label: '3 Parts', desc: 'Hook + 1 Story + Ending' },
                  { parts: 4 as const, sec: 32, label: '4 Parts', desc: 'Hook + 2 Story + Ending' },
                  { parts: 5 as const, sec: 40, label: '5 Parts', desc: 'Hook + 3 Story + Ending' },
                  { parts: 6 as const, sec: 48, label: '6 Parts', desc: 'Hook + 4 Story + Ending' },
                ].map((item) => (
                  <button
                    key={item.parts}
                    type="button"
                    onClick={() => {
                      setSelectedPartCount(item.parts);
                      setError('');
                    }}
                    className={`p-3.5 rounded-xl border text-center transition-all relative ${
                      selectedPartCount === item.parts
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base font-extrabold text-slate-100">{item.label}</div>
                    <div className="text-xs font-semibold text-indigo-400 mt-0.5">{item.sec} Seconds</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</div>
                    {selectedPartCount === item.parts && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    )}
                  </button>
                ))}
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Configured: <strong>{selectedPartCount} Parts</strong> = <strong>{selectedPartCount * 8} Seconds</strong></span>
                </span>
                <span className="text-[11px] text-slate-500">Max 8s per part</span>
              </div>
            </div>
          ) : (
            /* 16:9 Duration UI: Minimum 3 minutes, numeric input */
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Video Duration (Minutes) — <span className="text-indigo-400">Min 3 min</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="3"
                        max="60"
                        step="0.5"
                        value={durationMinutes}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setDurationMinutes(isNaN(val) ? 3 : val);
                          if (val >= 3) setError('');
                        }}
                        className={`w-32 bg-slate-900 border rounded-lg px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none ${
                          durationMinutes < 3 ? 'border-rose-500 text-rose-300' : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      <span className="text-xs text-slate-400">minutes</span>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                    {[3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setDurationMinutes(m);
                          setError('');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                          durationMinutes === m
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Preview */}
                <div className="border-t border-slate-800/80 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">Total Duration</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {durationMinutes} min ({calculatedSeconds169}s)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">Calculated Parts</span>
                    <span className="font-bold text-indigo-400 text-sm">
                      {calculatedParts169} Parts
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">Part Formula</span>
                    <span className="text-slate-400 text-[11px] block truncate">
                      Ceil({calculatedSeconds169}s / 8s) = {calculatedParts169}
                    </span>
                  </div>
                </div>

                {durationMinutes < 3 && (
                  <div className="text-rose-400 text-xs flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Duration must be at least 3 minutes for 16:9 landscape videos.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-xs cursor-pointer"
          >
            <span>Create & Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
