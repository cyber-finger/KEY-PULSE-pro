/**
 * Text segmentation & Language detection utilities.
 * Ensures complex Indic scripts (Bengali, Hindi, etc.) with combining vowel signs
 * (কার, ফলা, হসন্ত) are segmented into complete grapheme clusters rather than isolated
 * combining characters, avoiding orphaned dotted circles (◌).
 */

export interface GraphemeCluster {
  text: string;
  index: number;
  length: number;
}

// Regex fallback for Bengali grapheme clusters if Intl.Segmenter is unavailable
const BENGALI_GRAPHEME_REGEX = /(?:[\u0980-\u09FF][\u09BC]?[\u09CD]?[\u0980-\u09FF]?[\u09BC]?[\u09BE-\u09CC\u09D7\u0981-\u0983]*)|(?:[^\u0980-\u09FF])/g;

/**
 * Breaks a word or string into atomic grapheme clusters.
 * In Bengali: 'বি' stays together, 'প্ল' stays together, 'ব' stays together.
 * No dotted circle (◌) is produced.
 */
export function getGraphemeClusters(text: string, lang: string = 'en'): GraphemeCluster[] {
  if (!text) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(lang === 'bn' ? 'bn' : 'en', { granularity: 'grapheme' });
      const clusters: GraphemeCluster[] = [];
      let currentIdx = 0;

      for (const seg of segmenter.segment(text)) {
        clusters.push({
          text: seg.segment,
          index: currentIdx,
          length: seg.segment.length
        });
        currentIdx += seg.segment.length;
      }
      return clusters;
    } catch {
      // fallback below
    }
  }

  // Fallback for environments lacking Intl.Segmenter
  const isBengali = /[\u0980-\u09FF]/.test(text);
  if (isBengali) {
    const matches = text.match(BENGALI_GRAPHEME_REGEX) || text.split('');
    const clusters: GraphemeCluster[] = [];
    let currentIdx = 0;
    for (const m of matches) {
      clusters.push({
        text: m,
        index: currentIdx,
        length: m.length
      });
      currentIdx += m.length;
    }
    return clusters;
  }

  // Standard Latin char split fallback
  return text.split('').map((char, idx) => ({
    text: char,
    index: idx,
    length: 1
  }));
}

/**
 * Checks whether a given string contains Bengali Unicode characters.
 */
export function isBengaliText(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Auto-detects whether user input text is Bengali or English.
 */
export function detectLanguage(text: string): 'bengali' | 'english' | 'unknown' {
  if (!text) return 'unknown';

  let bnCount = 0;
  let enCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Bengali Unicode block: 0x0980 to 0x09FF
    if (code >= 0x0980 && code <= 0x09FF) {
      bnCount++;
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      enCount++;
    }
  }

  if (bnCount > 0 && bnCount >= enCount) return 'bengali';
  if (enCount > 0) return 'english';
  return 'unknown';
}
