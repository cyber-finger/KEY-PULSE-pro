export type TestMode = 'time' | 'words' | 'quote' | 'custom';
export type TimeOption = number;
export type WordOption = 25 | 50 | 100;
export type TextCategory = 'common-words' | 'quotes' | 'code' | 'punctuation' | 'bengali' | 'syntax-drills' | 'weak-keys' | 'custom';

export interface SecondTelemetry {
  second: number;
  wpm: number;
  rawWpm: number;
  cpm: number;
  errors: number;
  accuracy: number;
}

export interface TypingSession {
  id: string;
  userId: string;
  wpm: number;
  cpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number; // in seconds
  characterCount: number;
  errorCount: number;
  maxCombo?: number;
  errorTarget?: number | 'off';
  targetMet?: boolean;
  mode: string;
  category: string;
  timestamp: string; // ISO string
  telemetryHistory?: SecondTelemetry[];
  missedCharacters?: Record<string, number>;
  charFrequency?: Record<string, number>;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic';
export type BadgeCategory = 'speed' | 'volume' | 'accuracy' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  icon: string;
  targetMetric: 'wpm' | 'totalWords' | 'accuracy' | 'testsCompleted' | 'special';
  targetValue: number;
  points: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bestWpm: number;
  bestCpm: number;
  testsCompleted: number;
  averageAccuracy: number;
  totalWordsTyped?: number;
  achievementPoints?: number;
  unlockedBadgeIds?: string[];
  pinnedBadgeId?: string;
  favoriteQuote?: string;
  lastUsernameChangeDate?: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  mode: string;
  category?: string;
  pinnedBadgeId?: string;
  achievementPoints?: number;
  favoriteQuote?: string;
  timestamp: string;
}

export interface CustomText {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}

export type ThemeName = 'midnight' | 'matrix' | 'carbon' | 'amber' | 'dracula' | 'paper';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  isDark: boolean;
  bg: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  accent: string;
  accentText: string;
  correct: string;
  incorrect: string;
  caret: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  soundType: 'mechanical' | 'soft' | 'click' | 'silent';
  theme: ThemeName;
  smoothCaret: boolean;
  showLiveWpm: boolean;
  showLiveCpm: boolean;
  showLiveAccuracy: boolean;
  quickRestartKey: boolean;
  fontSize: 'small' | 'medium' | 'large';
  zenMode?: boolean;
  ghostMode?: boolean;
  blindMode?: boolean;
  comboFx?: boolean;
  autoDetectKeyboardLang?: boolean;
  campaignErrorTarget?: number | 'off';
  errorTarget?: number | 'off';
  strictErrorMode?: boolean;
}
