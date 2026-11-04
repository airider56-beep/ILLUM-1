import { GoogleGenAI, Type } from '@google/genai';
import { SourceAnalysis } from './db';

/**
 * Mandatory Source Story Analysis Engine (Phase 3 Critical Requirement 1)
 * Extracts structured facts, chronology, characters, locations, dates, and gaps
 * strictly from the supplied source story without inventing details or using generic AI lore.
 */
export async function analyzeSourceStory(sourceText: string): Promise<SourceAnalysis> {
  const cleanText = (sourceText || '').trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount < 15) {
    throw new Error(
      `Source story contains insufficient text (${wordCount} words; minimum 15 words required for factual analysis). Please supply a more complete narrative in Tab 1 (Source Story) before proceeding.`
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are ILLYUM's Factual Source Story Analyzer.
Your task is to analyze the user's provided original Source Story with absolute fidelity.

STRICT OPERATING RULES (Phase 3 PRD Requirement 1):
1. EXTRACT STRICTLY FROM THE SOURCE:
   - Extract only the facts, characters, events, chronology, dates, and locations explicitly present in the text.
2. ZERO INVENTIONS & ZERO FABRICATIONS:
   - NEVER invent fictional characters, incidents, dialogue, dates, locations, facts, or conclusions.
   - Do NOT use generic AI knowledge or Wikipedia lore to supplement facts missing from the source.
3. PRESERVE ORIGINAL CHRONOLOGY:
   - Capture events in the exact sequence in which they happened or were reported in the source text.
4. IDENTIFY MISSING OR AMBIGUOUS DETAILS:
   - If the source lacks background, resolutions, dates, or causes, explicitly flag each gap in missingOrAmbiguous. Do NOT fill them with imagination.`;

      const prompt = `Perform a factual source analysis of the following complete source story:

--- ORIGINAL SOURCE STORY ---
${cleanText}
--- END SOURCE STORY ---

Extract all verified facts, characters, chronological sequence, locations, dates, narrative arc, and missing details.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainSubjectAndCharacters: {
                type: Type.ARRAY,
                description: 'Key subjects, historical figures, organizations, or characters named in the text.',
                items: { type: Type.STRING },
              },
              keyFacts: {
                type: Type.ARRAY,
                description: 'Verified key facts directly grounded in the source text.',
                items: { type: Type.STRING },
              },
              chronology: {
                type: Type.ARRAY,
                description: 'Sequential order of events as described in the source.',
                items: { type: Type.STRING },
              },
              locationsAndDates: {
                type: Type.ARRAY,
                description: 'Specific geographical places, years, or dates explicitly noted.',
                items: { type: Type.STRING },
              },
              keyDevelopments: {
                type: Type.ARRAY,
                description: 'Major discoveries, turning points, or milestones mentioned.',
                items: { type: Type.STRING },
              },
              narrativeArc: {
                type: Type.OBJECT,
                properties: {
                  beginning: { type: Type.STRING, description: 'How the source story opens / context.' },
                  middle: { type: Type.STRING, description: 'Core investigation, conflict, or body of the story.' },
                  ending: { type: Type.STRING, description: 'Conclusion or latest verified status in the text.' },
                },
                required: ['beginning', 'middle', 'ending'],
              },
              missingOrAmbiguous: {
                type: Type.ARRAY,
                description: 'Gaps, unresolved questions, or missing context in the original text.',
                items: { type: Type.STRING },
              },
            },
            required: [
              'mainSubjectAndCharacters',
              'keyFacts',
              'chronology',
              'locationsAndDates',
              'keyDevelopments',
              'narrativeArc',
              'missingOrAmbiguous',
            ],
          },
        },
      });

      const raw = response.text || '{}';
      const parsed = JSON.parse(raw);

      if (parsed.keyFacts && Array.isArray(parsed.keyFacts) && parsed.keyFacts.length > 0) {
        return {
          mainSubjectAndCharacters: parsed.mainSubjectAndCharacters || [],
          keyFacts: parsed.keyFacts || [],
          chronology: parsed.chronology || [],
          locationsAndDates: parsed.locationsAndDates || [],
          keyDevelopments: parsed.keyDevelopments || [],
          narrativeArc: parsed.narrativeArc || { beginning: '', middle: '', ending: '' },
          missingOrAmbiguous: parsed.missingOrAmbiguous || [],
          analyzedAt: new Date().toISOString(),
          sourceWordCount: wordCount,
          modelUsed: 'gemini-3.8-flash',
        };
      }
    } catch (apiErr: any) {
      console.warn('Gemini Source Analysis API call error, falling back to deterministic analyzer:', apiErr.message);
    }
  }

  // Deterministic NLP Factual Analysis Engine (Offline Fallback)
  return runDeterministicSourceAnalysis(cleanText, wordCount);
}

/**
 * Deterministic analysis engine that extracts facts, chronology, entities,
 * and gaps directly from sentence syntax without inventing information.
 */
function runDeterministicSourceAnalysis(sourceText: string, wordCount: number): SourceAnalysis {
  const sentences = sourceText
    .replace(/([.?!।])\s*(?=[A-Z0-9\u0900-\u097F])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  // Extract dates and years (e.g. 1901, 1977, 2000, 21st century)
  const dateMatches = sourceText.match(/\b(?:\d{3,4}(?:s|\b)|century|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi) || [];
  const uniqueDates = Array.from(new Set(dateMatches));

  // Extract proper nouns / capitalized entity phrases
  const entityMatches = sourceText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const commonStopWords = new Set(['The', 'In', 'It', 'As', 'And', 'What', 'After', 'This', 'When', 'With', 'From', 'By', 'For', 'At']);
  const uniqueEntities = Array.from(new Set(entityMatches.filter((e) => !commonStopWords.has(e)))).slice(0, 8);

  const keyFacts = sentences.map((s) => s.replace(/\s+/g, ' ').trim());
  const chronology = sentences.map((s, idx) => `Step ${idx + 1}: ${s.replace(/\s+/g, ' ').trim()}`);

  const beginning = sentences[0] || '';
  const middle = sentences.length > 2 ? sentences.slice(1, -1).join(' ') : (sentences[1] || sentences[0] || '');
  const ending = sentences[sentences.length - 1] || sentences[0] || '';

  const missingOrAmbiguous: string[] = [];
  if (sentences.length < 3) {
    missingOrAmbiguous.push('Source story is very short; subsequent historical context or aftermath details are missing.');
  }
  if (uniqueDates.length === 0) {
    missingOrAmbiguous.push('Exact dates or time periods are not explicitly provided in the source text.');
  }

  return {
    mainSubjectAndCharacters: uniqueEntities.length > 0 ? uniqueEntities : ['Main subject described in source text'],
    keyFacts,
    chronology,
    locationsAndDates: uniqueDates.length > 0 ? uniqueDates : ['Not explicitly stated in source'],
    keyDevelopments: [sentences[0] || 'Primary event described in source'],
    narrativeArc: {
      beginning,
      middle,
      ending,
    },
    missingOrAmbiguous,
    analyzedAt: new Date().toISOString(),
    sourceWordCount: wordCount,
    modelUsed: 'gemini-3.8-flash (Offline Factual Extraction)',
  };
}
