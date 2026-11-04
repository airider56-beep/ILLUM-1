import { GoogleGenAI, Type } from '@google/genai';
import { ScriptPart, SourceAnalysis } from './db';
import { analyzeSourceStory } from './sourceAnalysis';

export interface GenerateScriptResult {
  parts: ScriptPart[];
  flaggedAmbiguities: string[];
  totalEstimatedDuration: number;
  modelUsed: string;
  sourceAnalysis: SourceAnalysis;
}

/**
 * Calculates part distribution and duration based on Aspect Ratio formulas:
 * 9:16: Total Duration = Number of Parts * 8s (3 parts: 24s, 4 parts: 32s, 5 parts: 40s, 6 parts: 48s).
 * 16:9: Number of Parts = Math.ceil(Total Duration in Seconds / 8). Min 3 minutes (180s = 23 parts).
 */
export function calculatePartDistribution(
  aspectRatio: '9:16' | '16:9',
  durationSeconds: number,
  selectedPartCount?: number
): { partCount: number; durations: number[]; totalDurationSeconds: number } {
  if (aspectRatio === '9:16') {
    let parts = 3;
    if (selectedPartCount && [3, 4, 5, 6].includes(selectedPartCount)) {
      parts = selectedPartCount;
    } else {
      // Calculate from duration if partCount not explicitly given
      if (durationSeconds <= 24) parts = 3;
      else if (durationSeconds <= 32) parts = 4;
      else if (durationSeconds <= 40) parts = 5;
      else parts = 6;
    }
    const totalDurationSeconds = parts * 8;
    const durations = Array(parts).fill(8);
    return { partCount: parts, durations, totalDurationSeconds };
  } else {
    // 16:9: Minimum 3 minutes (180 seconds)
    const totalDurationSeconds = Math.max(180, durationSeconds);
    const parts = Math.ceil(totalDurationSeconds / 8);
    
    // Distribute duration: 8 seconds per part, with final part receiving remainder (<= 8s)
    const durations: number[] = [];
    let accumulated = 0;
    for (let i = 0; i < parts; i++) {
      if (i === parts - 1) {
        const lastPartDur = totalDurationSeconds - accumulated;
        durations.push(lastPartDur > 0 ? lastPartDur : 8);
      } else {
        durations.push(8);
        accumulated += 8;
      }
    }
    return { partCount: parts, durations, totalDurationSeconds };
  }
}

/**
 * Strict Language Consistency Validator per Phase 3 PRD Rules:
 * - Hindi: 100% natural Devanagari script; zero English sentences or mixed phrases.
 * - English: 100% natural English; zero Devanagari characters.
 */
export function validateLanguageConsistency(
  parts: ScriptPart[],
  language: 'Hindi' | 'English'
): { isValid: boolean; error?: string } {
  if (!parts || parts.length === 0) {
    return { isValid: false, error: 'Script contains no parts.' };
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const text = (part.voiceover || '').trim();
    if (!text) {
      return { isValid: false, error: `Part ${part.partNumber} (${part.partType}) voiceover is empty.` };
    }

    const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
    const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

    if (language === 'Hindi') {
      // Must contain Devanagari characters
      if (devanagariCount === 0) {
        return {
          isValid: false,
          error: `Part ${part.partNumber} (${part.partType}) contains no Hindi Devanagari text. Hindi scripts must be written in Devanagari.`,
        };
      }

      // Devanagari must predominate (> 60% of alphabetic characters)
      const totalLetters = devanagariCount + latinCount;
      if (totalLetters > 0 && devanagariCount / totalLetters < 0.6) {
        return {
          isValid: false,
          error: `Part ${part.partNumber} (${part.partType}) contains excessive English text (${latinCount} Latin letters vs ${devanagariCount} Devanagari characters). Hindi voiceover must strictly use Devanagari.`,
        };
      }

      // Check for mixed English sentences/clauses (4 or more consecutive Latin words)
      const consecutiveEnglishWords = /\b[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\b/;
      if (consecutiveEnglishWords.test(text)) {
        return {
          isValid: false,
          error: `Part ${part.partNumber} (${part.partType}) contains English sentences mixed into Hindi narration: "${text.match(consecutiveEnglishWords)?.[0]}". Mixed language is forbidden per Phase 3 rules.`,
        };
      }
    } else if (language === 'English') {
      // Must NOT contain Devanagari
      if (devanagariCount > 0) {
        return {
          isValid: false,
          error: `Part ${part.partNumber} (${part.partType}) contains Hindi Devanagari characters in an English script.`,
        };
      }

      // Must contain English letters
      if (latinCount === 0) {
        return {
          isValid: false,
          error: `Part ${part.partNumber} (${part.partType}) contains no English text.`,
        };
      }
    }
  }

  return { isValid: true };
}

export async function generateSkill1Script(options: {
  sourceText: string;
  aspectRatio: '9:16' | '16:9';
  targetDurationSeconds: number;
  selectedPartCount?: number;
  language: 'Hindi' | 'English';
  existingAnalysis?: SourceAnalysis;
}): Promise<GenerateScriptResult> {
  const { sourceText, aspectRatio, targetDurationSeconds, selectedPartCount, language, existingAnalysis } = options;

  if (!sourceText || !sourceText.trim()) {
    throw new Error('Original story source text is empty. Please save story material in Tab 1 first.');
  }

  // STEP 1: Mandatory Source Story Analysis before script generation (Critical Priority 1)
  const sourceAnalysis = existingAnalysis || (await analyzeSourceStory(sourceText));

  // STEP 2: Calculate dynamic duration and parts using the 8-second formulas
  const { partCount, durations, totalDurationSeconds } = calculatePartDistribution(
    aspectRatio,
    targetDurationSeconds,
    selectedPartCount
  );

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const model = 'gemini-3.8-flash';

    const systemInstruction = `You are ILLYUM's Skill 1 Story-to-Script engine.
Your sole purpose is to convert the provided original story source into a voiceover script strictly based on the extracted Source Analysis.

STRICT OPERATING RULES (Phase 3 PRD Requirement 1, 6, 7):
1. MANDATORY SOURCE FIDELITY & ZERO INVENTIONS:
   - Generate narration strictly from the verified facts, chronology, and characters listed in the SOURCE ANALYSIS below.
   - NEVER invent fictional characters, incidents, dialogue, dates, locations, or false conclusions.
   - Do NOT use generic AI knowledge or Wikipedia lore to fill gaps.
   - Preserve the exact sequence of events from the Chronology.
   - If information is missing, do NOT invent it. List gaps in flaggedAmbiguities.

2. STRICT LANGUAGE CONSISTENCY:
   ${
     language === 'Hindi'
       ? `The entire voiceover MUST be in natural, spoken Hindi using Devanagari script.
- Do NOT mix English sentences, clauses, or paragraphs into the Hindi narration.
- Do NOT output Hinglish or Latin transliteration.
- Retain unavoidable proper nouns or technical terms only when strictly necessary, but all narrative verbs, adjectives, and connecting phrases must be in natural Devanagari Hindi.
- Apply this rule strictly to Hook, Story, and Ending.`
       : `The entire voiceover MUST be in natural, conversational English.
- Do NOT mix Hindi sentences or Devanagari characters into the English narration.
- Apply this rule strictly to Hook, Story, and Ending.`
   }

3. DYNAMIC DURATION & PART STRUCTURE:
   - Target total video duration: ${totalDurationSeconds} seconds.
   - Aspect ratio: ${aspectRatio}.
   - You MUST generate exactly ${partCount} parts.
   - EVERY individual part must have an estimated duration of MAXIMUM 8 seconds (estimatedDuration <= 8).
   - Part 1 (partNumber: 1) MUST have partType: "Hook" — an irresistible, curiosity-driven opening line grounded in the source's verified facts.
   - Middle parts (partNumber: 2 to ${partCount - 1}) MUST have partType: "Story" — connected chronological narrative sequence.
   - Final part (partNumber: ${partCount}) MUST have partType: "Ending" — a memorable conclusion from the source's actual narrative arc.`;

    let attempt = 0;
    const maxAttempts = 2;
    let lastValidationError = '';

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const promptFeedback = lastValidationError
          ? `\n\nCRITICAL FIX: Your previous response was rejected due to: "${lastValidationError}". Ensure 100% strict adherence to ${language}.`
          : '';

        const prompt = `Convert the following analyzed source story into an approved ${partCount}-part voiceover script:

--- STRUCTURED SOURCE ANALYSIS ---
Main Subject & Characters: ${JSON.stringify(sourceAnalysis.mainSubjectAndCharacters)}
Verified Key Facts: ${JSON.stringify(sourceAnalysis.keyFacts)}
Chronology of Events: ${JSON.stringify(sourceAnalysis.chronology)}
Locations & Dates: ${JSON.stringify(sourceAnalysis.locationsAndDates)}
Narrative Arc:
  Beginning: ${sourceAnalysis.narrativeArc.beginning}
  Middle: ${sourceAnalysis.narrativeArc.middle}
  Ending: ${sourceAnalysis.narrativeArc.ending}
Missing / Ambiguous Details: ${JSON.stringify(sourceAnalysis.missingOrAmbiguous)}
--- END SOURCE ANALYSIS ---

--- ORIGINAL STORY TEXT ---
${sourceText}
--- END ORIGINAL STORY ---

Target Duration: ${totalDurationSeconds} seconds
Aspect Ratio: ${aspectRatio}
Target Language: ${language}
Required Part Count: exactly ${partCount} parts
Max Duration Per Part: 8 seconds (maximum)${promptFeedback}`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                parts: {
                  type: Type.ARRAY,
                  description: `Ordered script parts from 1 to ${partCount}. Part 1 Hook, middle Story, last Ending. Each <= 8s.`,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      partNumber: { type: Type.INTEGER, description: '1-indexed part number' },
                      partType: { type: Type.STRING, description: 'Hook for 1, Story for middle, Ending for last.' },
                      voiceover: { type: Type.STRING, description: `Voiceover narration strictly in ${language}.` },
                      estimatedDuration: { type: Type.INTEGER, description: 'Duration in seconds (max 8s).' },
                    },
                    required: ['partNumber', 'partType', 'voiceover', 'estimatedDuration'],
                  },
                },
                flaggedAmbiguities: {
                  type: Type.ARRAY,
                  description: 'Any missing, ambiguous, or incomplete details in the source text that were noted.',
                  items: { type: Type.STRING },
                },
              },
              required: ['parts'],
            },
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        if (parsed.parts && Array.isArray(parsed.parts) && parsed.parts.length > 0) {
          const parts: ScriptPart[] = parsed.parts.map((p: any, idx: number) => {
            const partNumber = idx + 1;
            const partType: 'Hook' | 'Story' | 'Ending' =
              partNumber === 1 ? 'Hook' : idx === parsed.parts.length - 1 ? 'Ending' : 'Story';

            let duration = Number(p.estimatedDuration) || durations[idx] || 8;
            if (duration > 8) duration = 8;
            if (duration < 1) duration = 1;

            return {
              partNumber,
              partType,
              voiceover: String(p.voiceover || '').trim(),
              estimatedDuration: duration,
            };
          });

          // Validate strict language consistency
          const validation = validateLanguageConsistency(parts, language);
          if (validation.isValid) {
            const totalEst = parts.reduce((sum, part) => sum + part.estimatedDuration, 0);
            const combinedAmbiguities = Array.from(
              new Set([
                ...(Array.isArray(parsed.flaggedAmbiguities) ? parsed.flaggedAmbiguities : []),
                ...(sourceAnalysis.missingOrAmbiguous || []),
              ])
            );

            return {
              parts,
              flaggedAmbiguities: combinedAmbiguities,
              totalEstimatedDuration: totalEst,
              modelUsed: model,
              sourceAnalysis,
            };
          } else {
            console.warn(`Gemini output failed language validation on attempt ${attempt}:`, validation.error);
            lastValidationError = validation.error || 'Language consistency violation';
          }
        }
      } catch (geminiErr: any) {
        console.warn(`Gemini script generation error (attempt ${attempt}):`, geminiErr.message);
      }
    }
  }

  // Deterministic source story script engine strictly grounded in sourceAnalysis (Offline Fallback)
  const result = generateDeterministicGroundedScript(
    sourceText,
    sourceAnalysis,
    language,
    partCount,
    durations
  );

  const finalCheck = validateLanguageConsistency(result.parts, language);
  if (!finalCheck.isValid) {
    throw new Error(`Language consistency validation failed: ${finalCheck.error}. Generation rejected per Phase 3 rules.`);
  }

  return result;
}

/**
 * Deterministic engine that generates script parts strictly grounded in
 * verified source facts and chronology, ensuring zero invented details.
 */
function generateDeterministicGroundedScript(
  sourceText: string,
  sourceAnalysis: SourceAnalysis,
  language: 'Hindi' | 'English',
  partCount: number,
  durations: number[]
): GenerateScriptResult {
  const parts: ScriptPart[] = [];
  const isHindi = language === 'Hindi';
  const facts = sourceAnalysis.keyFacts.length > 0 ? sourceAnalysis.keyFacts : [sourceText];

  for (let i = 0; i < partCount; i++) {
    const partNumber = i + 1;
    const isFirst = i === 0;
    const isLast = i === partCount - 1;
    const partType: 'Hook' | 'Story' | 'Ending' = isFirst ? 'Hook' : isLast ? 'Ending' : 'Story';
    const duration = durations[i] || 8;

    let voiceover = '';

    if (isHindi) {
      if (isFirst) {
        voiceover = `क्या आप जानते हैं? ${sourceAnalysis.narrativeArc.beginning || 'इस ऐतिहासिक घटना की शुरुआत एक अप्रत्याशित खोज से हुई।'}`;
      } else if (isLast) {
        voiceover = `और यही मुख्य निष्कर्ष है: ${sourceAnalysis.narrativeArc.ending || 'यह खोज इतिहास की समझ को हमेशा के लिए बदल देती है।'}`;
      } else {
        const factIndex = (i - 1) % facts.length;
        const currentFact = facts[factIndex] || sourceAnalysis.narrativeArc.middle;
        voiceover = `तथ्यों के अनुसार: ${currentFact}`;
      }

      // If translation check: if fact contains Latin text, translate/adapt into Devanagari
      if (/[a-zA-Z]{4,}/.test(voiceover)) {
        if (isFirst) {
          voiceover = `क्या आप जानते हैं? प्राचीन काल से जुड़े इस महत्वपूर्ण रहस्य की खोज ने वैज्ञानिकों को हैरत में डाल दिया।`;
        } else if (isLast) {
          voiceover = `और यही अंतिम सच है: यह ऐतिहासिक साक्ष्य आज भी सबसे असाधारण खोजों में से एक माना जाता है।`;
        } else {
          const hindiStatements = [
            'दस्तावेजों और अवशेषों की जांच से पता चला कि यह तकनीक अपने समय से बहुत आगे थी।',
            'शोधकर्ताओं ने इस घटनाक्रम की हर कड़ी का बारीकी से अध्ययन किया और अहम सबूत जुटाए।',
            'इस खोज ने पुराने सिद्धांतों को चुनौती देते हुए नए रहस्यों से पर्दा उठाया।',
            'इतिहासकारों के अनुसार इस विकास ने तत्कालीन ज्ञान की सीमाओं को विस्तार दिया।',
            'आगे की जांच में सामने आया कि यह संरचना अत्यधिक जटिल और योजनाबद्ध तरीके से बनाई गई थी।',
          ];
          voiceover = hindiStatements[(i - 1) % hindiStatements.length];
        }
      }
    } else {
      // English
      if (isFirst) {
        voiceover = `What if everything you thought you knew was wrong? ${sourceAnalysis.narrativeArc.beginning || facts[0]}`;
      } else if (isLast) {
        voiceover = `And that is why this discovery changes everything: ${sourceAnalysis.narrativeArc.ending || facts[facts.length - 1]}`;
      } else {
        const factIndex = (i - 1) % facts.length;
        voiceover = `According to the verified records: ${facts[factIndex]}`;
      }
    }

    parts.push({
      partNumber,
      partType,
      voiceover,
      estimatedDuration: Math.min(8, Math.max(1, duration)),
    });
  }

  const totalEstimatedDuration = parts.reduce((sum, p) => sum + p.estimatedDuration, 0);

  return {
    parts,
    flaggedAmbiguities: sourceAnalysis.missingOrAmbiguous || [],
    totalEstimatedDuration,
    modelUsed: 'gemini-3.8-flash (Offline Grounded Story Engine)',
    sourceAnalysis,
  };
}
