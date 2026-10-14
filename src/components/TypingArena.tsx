import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Clock,
  Type,
  Quote,
  Code,
  Sparkles,
  Zap,
  Target,
  Gauge,
  AlertCircle,
  Upload,
  Timer,
  Gamepad2,
  Ghost,
  Flame,
  Eye,
  EyeOff,
  Crosshair,
  BookOpen,
  Keyboard,
  Globe,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  TestMode,
  TimeOption,
  WordOption,
  TextCategory,
  TypingSession,
  SecondTelemetry,
  AppSettings,
  CustomText
} from '../types';
import {
  generateRandomWords,
  getRandomQuote,
  getRandomCode,
  getRandomPunctuation,
  generateRandomBengaliWords,
  getRandomBengaliQuote,
  getRandomSyntaxDrill,
  generateWeakKeyDrill
} from '../data/textLibraries';
import { THEMES } from '../data/themes';
import { soundSynth } from '../utils/audio';
import { CustomTextModal } from './CustomTextModal';
import { getGraphemeClusters, detectLanguage, isBengaliText } from '../utils/textSegmentation';
import { CustomTimerModal } from './CustomTimerModal';

interface TypingArenaProps {
  onComplete: (session: TypingSession) => void;
  settings: AppSettings;
  customTextOverride?: string | null;
  customTextTitle?: string | null;
  onClearCustomOverride?: () => void;
  savedCustomTexts?: CustomText[];
  onAddCustomText?: (text: CustomText) => void;
  onLoadCustomText?: (content: string, title: string) => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenCampaignMode?: () => void;
  sessions?: TypingSession[];
  onToggleGhostMode?: () => void;
  onUpdateSettings?: (updates: Partial<AppSettings>) => void;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  onComplete,
  settings,
  customTextOverride,
  customTextTitle,
  onClearCustomOverride,
  savedCustomTexts = [],
  onAddCustomText,
  onLoadCustomText,
  zenMode = false,
  onToggleZenMode,
  onOpenCampaignMode,
  sessions = [],
  onToggleGhostMode,
  onUpdateSettings
}) => {
  // Test configuration
  const [mode, setMode] = useState<TestMode>('time');
  const [timeOption, setTimeOption] = useState<TimeOption>(60);
  const [wordOption, setWordOption] = useState<WordOption>(50);
  const [category, setCategory] = useState<TextCategory>('common-words');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCustomTimerModalOpen, setIsCustomTimerModalOpen] = useState(false);
  const [currentCustomTitle, setCurrentCustomTitle] = useState<string | null>(customTextTitle || null);

  // Text state
  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Live Metrics
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const [currentCpm, setCurrentCpm] = useState<number>(0);
  const [currentRawWpm, setCurrentRawWpm] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(100);
  const [errorCount, setErrorCount] = useState<number>(0);

  // Blind Touch-Typing Mode (Masked typed characters)
  const [blindMode, setBlindMode] = useState<boolean>(() => settings.blindMode ?? false);

  // Speed Burst & Combo Streak
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const maxComboRef = useRef<number>(0);
  const comboMilestoneRef = useRef<number>(0);

  // Automatically calculate user's top weak/missed keys from previous sessions
  const userWeakKeys = React.useMemo(() => {
    const errorTally: Record<string, number> = {};
    sessions.forEach(sess => {
      if (sess.missedCharacters) {
        Object.entries(sess.missedCharacters).forEach(([char, count]) => {
          const trimmed = char.trim();
          if (trimmed && trimmed.length === 1) {
            errorTally[trimmed.toLowerCase()] = (errorTally[trimmed.toLowerCase()] || 0) + count;
          }
        });
      }
    });
    const sorted = Object.entries(errorTally)
      .sort((a, b) => b[1] - a[1])
      .map(([char]) => char);
    return sorted.length > 0 ? sorted.slice(0, 5) : ['p', 'q', 'z', 'x', 'b'];
  }, [sessions]);

  useEffect(() => {
    if (settings.blindMode !== undefined) {
      setBlindMode(settings.blindMode);
    }
  }, [settings.blindMode]);

  // Keyboard Language Auto-Detection
  const [autoDetectKeyboardLang, setAutoDetectKeyboardLang] = useState<boolean>(
    () => settings.autoDetectKeyboardLang !== false
  );
  const [detectedKeyboardLang, setDetectedKeyboardLang] = useState<'bengali' | 'english' | 'unknown'>('unknown');
  const [langToast, setLangToast] = useState<{
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
    lang: 'bengali' | 'english' | 'unknown';
  } | null>(null);
  const langToastTimerRef = useRef<number | null>(null);
  const lastNotifiedStateRef = useRef<string>('');

  const showLanguageNotification = useCallback((
    lang: 'bengali' | 'english',
    currentCategory: string,
    force: boolean = false
  ) => {
    const isBengaliTarget = currentCategory === 'bengali' || isBengaliText(targetTextRef.current);
    const stateKey = `${lang}-${isBengaliTarget ? 'bn' : 'en'}`;

    if (!force && lastNotifiedStateRef.current === stateKey) {
      return;
    }
    lastNotifiedStateRef.current = stateKey;

    if (langToastTimerRef.current) {
      window.clearTimeout(langToastTimerRef.current);
    }

    let title = '';
    let message = '';
    let type: 'success' | 'warning' | 'info' = 'info';

    if (isBengaliTarget) {
      if (lang === 'bengali') {
        title = 'বাংলা কীবোর্ড সক্রিয় (Bengali Keyboard Active)';
        message = '✓ কীবোর্ড ভাষা: বাংলা শনাক্ত হয়েছে! ইউনিকোড / অভ্র দিয়ে সরাসরি টাইপ করুন।';
        type = 'success';
      } else {
        title = '⚠️ ইংরেজি কীবোর্ড শনাক্ত হয়েছে!';
        message = 'আপনি বাংলা টাইপিং মোডে আছেন। বাংলা লিখতে Avro (F12) চালু করুন বা বাংলা কীবোর্ড সিলেক্ট করুন।';
        type = 'warning';
      }
    } else {
      if (lang === 'english') {
        title = 'ইংরেজি কীবোর্ড সক্রিয় (English Keyboard Active)';
        message = '✓ কীবোর্ড ভাষা: ইংরেজি শনাক্ত হয়েছে! স্ট্যান্ডার্ড QWERTY টাইপিং চলছে।';
        type = 'success';
      } else {
        title = '⚠️ বাংলা কীবোর্ড শনাক্ত হয়েছে!';
        message = 'আপনি ইংরেজি টাইপিং মোডে আছেন। ইংরেজি টেস্টের জন্য কীবোর্ড লেআউট ইংরেজিতে পরিবর্তন করুন বা Avro বন্ধ করুন (F12)।';
        type = 'warning';
      }
    }

    setLangToast({ title, message, type, lang });
    langToastTimerRef.current = window.setTimeout(() => {
      setLangToast(null);
    }, 5000);
  }, []);

  useEffect(() => {
    if (settings.autoDetectKeyboardLang !== undefined) {
      setAutoDetectKeyboardLang(settings.autoDetectKeyboardLang);
    }
  }, [settings.autoDetectKeyboardLang]);

  // Re-check language compatibility whenever category or target text changes
  useEffect(() => {
    if (!autoDetectKeyboardLang || detectedKeyboardLang === 'unknown') return;
    const isBengaliTarget = category === 'bengali' || isBengaliText(targetText);
    const isMismatch = (isBengaliTarget && detectedKeyboardLang === 'english') ||
                       (!isBengaliTarget && detectedKeyboardLang === 'bengali');
    if (isMismatch) {
      showLanguageNotification(detectedKeyboardLang, category, true);
    }
  }, [category, targetText, autoDetectKeyboardLang, detectedKeyboardLang, showLanguageNotification]);

  // Synchronization refs to avoid nested or re-entrant state updates
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const timeOptionRef = useRef(timeOption);
  timeOptionRef.current = timeOption;
  const wordOptionRef = useRef(wordOption);
  wordOptionRef.current = wordOption;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;
  const typedTextRef = useRef(typedText);
  typedTextRef.current = typedText;
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const isFinishedRef = useRef(isFinished);
  isFinishedRef.current = isFinished;
  const elapsedTimeRef = useRef(elapsedTime);
  elapsedTimeRef.current = elapsedTime;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const errorCountRef = useRef(errorCount);
  errorCountRef.current = errorCount;

  // Tracking data
  const telemetryHistoryRef = useRef<SecondTelemetry[]>([]);
  const missedCharsRef = useRef<Record<string, number>>({});
  const charFrequencyRef = useRef<Record<string, number>>({});
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const arenaContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCaretRef = useRef<HTMLSpanElement | null>(null);

  const theme = THEMES[settings.theme] || THEMES.midnight;

  // Auto-scroll the arena so active line stays comfortably in view
  useEffect(() => {
    if (activeCaretRef.current && arenaContainerRef.current) {
      const caret = activeCaretRef.current;
      const container = arenaContainerRef.current;
      const caretTop = caret.offsetTop;
      const containerHeight = container.clientHeight;

      if (caretTop > containerHeight * 0.4) {
        container.scrollTo({
          top: caretTop - containerHeight * 0.35,
          behavior: 'smooth'
        });
      }
    }
  }, [typedText]);

  // Find previous best session matching current mode/category to race against
  const currentModeString = mode === 'time' ? `${timeOption}s` : mode === 'words' ? `${wordOption}w` : mode;
  const bestSession = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const matching = sessions.filter(s => {
      const modeMatch = s.mode.toLowerCase().includes(currentModeString.toLowerCase()) ||
        (mode === 'time' && s.mode.includes(`${timeOption}`));
      return modeMatch && s.wpm > 0;
    });
    if (matching.length === 0) {
      return [...sessions].sort((a, b) => b.wpm - a.wpm)[0] || null;
    }
    return matching.sort((a, b) => b.wpm - a.wpm)[0];
  }, [sessions, currentModeString, mode, timeOption]);

  const isGhostModeActive = settings.ghostMode !== false && !!bestSession;

  // Real-time ghost typed position based on elapsed time and ghost session telemetry / average speed
  const ghostIndex = React.useMemo(() => {
    if (!isGhostModeActive || !bestSession || !isRunning || !targetText) return 0;
    const sec = elapsedTime;
    if (sec <= 0) return 0;

    // If telemetryHistory exists with second-by-second records, use exact historical progression
    if (bestSession.telemetryHistory && bestSession.telemetryHistory.length > 0) {
      const closestPoint = bestSession.telemetryHistory.find(t => t.second === sec) ||
        bestSession.telemetryHistory[Math.min(sec - 1, bestSession.telemetryHistory.length - 1)];

      if (closestPoint) {
        const charsFromWpm = Math.round((closestPoint.wpm * 5 / 60) * sec);
        return Math.min(targetText.length, charsFromWpm);
      }
    }

    // High accuracy linear projection using best session's overall characters/sec or CPM
    const cps = (bestSession.cpm || (bestSession.wpm * 5)) / 60;
    const computed = Math.round(cps * sec);
    return Math.min(targetText.length, computed);
  }, [isGhostModeActive, bestSession, isRunning, elapsedTime, targetText]);

  useEffect(() => {
    if (customTextOverride) {
      setMode('custom');
      if (customTextTitle) {
        setCurrentCustomTitle(customTextTitle);
      }
    }
  }, [customTextOverride, customTextTitle]);

  const handleLoadCustomText = (content: string, title: string) => {
    setMode('custom');
    setCurrentCustomTitle(title);
    setTargetText(content.trim());
    targetTextRef.current = content.trim();
    setTypedText('');
    typedTextRef.current = '';
    setIsRunning(false);
    isRunningRef.current = false;
    setIsFinished(false);
    isFinishedRef.current = false;
    setTimeLeft(0);
    timeLeftRef.current = 0;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setCurrentWpm(0);
    setCurrentCpm(0);
    setCurrentRawWpm(0);
    setCurrentAccuracy(100);
    setErrorCount(0);
    errorCountRef.current = 0;
    telemetryHistoryRef.current = [];
    missedCharsRef.current = {};

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onLoadCustomText) {
      onLoadCustomText(content, title);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Initialize or reset text
  const setupNewText = useCallback(() => {
    let text = '';
    if (mode === 'custom' && targetTextRef.current) {
      text = targetTextRef.current;
    } else if (customTextOverride) {
      text = customTextOverride.trim();
    } else if (mode === 'quote') {
      text = category === 'bengali' ? getRandomBengaliQuote().quote : getRandomQuote().quote;
    } else if (category === 'bengali') {
      text = mode === 'words'
        ? generateRandomBengaliWords(wordOption)
        : generateRandomBengaliWords(Math.max(40, Math.ceil((timeOption / 60) * 110)));
    } else if (category === 'syntax-drills') {
      text = getRandomSyntaxDrill();
    } else if (category === 'weak-keys') {
      text = generateWeakKeyDrill(userWeakKeys, mode === 'words' ? wordOption : Math.max(28, Math.ceil((timeOption / 60) * 70)));
    } else if (category === 'code') {
      text = getRandomCode().code.replace(/\t/g, '  ');
    } else if (category === 'punctuation') {
      text = getRandomPunctuation();
    } else if (mode === 'words') {
      text = generateRandomWords(wordOption);
    } else {
      // Time mode (scales words appropriately for custom or preset seconds)
      const neededWords = Math.max(50, Math.ceil((timeOption / 60) * 140));
      text = generateRandomWords(neededWords);
    }

    setTargetText(text);
    targetTextRef.current = text;
    setTypedText('');
    typedTextRef.current = '';
    setIsRunning(false);
    isRunningRef.current = false;
    setIsFinished(false);
    isFinishedRef.current = false;
    const initialTime = mode === 'time' ? timeOption : 0;
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setCurrentWpm(0);
    setCurrentCpm(0);
    setCurrentRawWpm(0);
    setCurrentAccuracy(100);
    setErrorCount(0);
    errorCountRef.current = 0;
    setCurrentCombo(0);
    setMaxCombo(0);
    maxComboRef.current = 0;
    comboMilestoneRef.current = 0;
    telemetryHistoryRef.current = [];
    missedCharsRef.current = {};

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [mode, timeOption, wordOption, category, customTextOverride, userWeakKeys]);

  useEffect(() => {
    setupNewText();
  }, [setupNewText]);

  // Finish test and calculate summary
  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsRunning(false);
    isRunningRef.current = false;
    setIsFinished(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const actualDuration = Math.max(1, elapsedTimeRef.current);
    const typed = typedTextRef.current;
    const target = targetTextRef.current;
    const validCharacters = typed.split('').filter((char, idx) => char === target[idx]).length;
    const finalAccuracy = typed.length > 0 ? Math.round((validCharacters / typed.length) * 1000) / 10 : 100;
    const finalWpm = Math.round(((validCharacters / 5) / (actualDuration / 60)));
    const finalCpm = Math.round((validCharacters / (actualDuration / 60)));
    const finalRawWpm = Math.round(((typed.length / 5) / (actualDuration / 60)));

    const session: TypingSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: 'local',
      wpm: finalWpm,
      cpm: finalCpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      duration: actualDuration,
      characterCount: typed.length,
      errorCount: errorCountRef.current,
      maxCombo: maxComboRef.current,
      mode: modeRef.current === 'time' ? `${timeOptionRef.current}s` : modeRef.current === 'words' ? `${wordOptionRef.current}w` : modeRef.current,
      category: categoryRef.current,
      timestamp: new Date().toISOString(),
      telemetryHistory: [...telemetryHistoryRef.current],
      missedCharacters: { ...missedCharsRef.current },
      charFrequency: { ...charFrequencyRef.current }
    };

    // Defer callback to next tick to avoid updating parent component during child render/updater
    setTimeout(() => {
      onComplete(session);
    }, 0);
  }, [onComplete]);

  // Main countdown / telemetry timer
  useEffect(() => {
    if (!isRunning || isFinished) return;

    timerRef.current = window.setInterval(() => {
      if (!isRunningRef.current || isFinishedRef.current) return;

      elapsedTimeRef.current += 1;
      const nextElapsed = elapsedTimeRef.current;
      setElapsedTime(nextElapsed);

      const typed = typedTextRef.current;
      const target = targetTextRef.current;
      const validCharacters = typed.split('').filter((char, idx) => char === target[idx]).length;
      const liveAccuracy = typed.length > 0 ? Math.round((validCharacters / typed.length) * 1000) / 10 : 100;
      const liveWpm = Math.round(((validCharacters / 5) / (nextElapsed / 60)));
      const liveCpm = Math.round((validCharacters / (nextElapsed / 60)));
      const liveRaw = Math.round(((typed.length / 5) / (nextElapsed / 60)));

      setCurrentWpm(liveWpm);
      setCurrentCpm(liveCpm);
      setCurrentRawWpm(liveRaw);
      setCurrentAccuracy(liveAccuracy);

      telemetryHistoryRef.current.push({
        second: nextElapsed,
        wpm: liveWpm,
        rawWpm: liveRaw,
        cpm: liveCpm,
        errors: errorCountRef.current,
        accuracy: liveAccuracy
      });

      if (modeRef.current === 'time') {
        timeLeftRef.current -= 1;
        const nextTimeLeft = timeLeftRef.current;
        setTimeLeft(nextTimeLeft);
        if (nextTimeLeft <= 0) {
          finishTest();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isFinished, finishTest]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinishedRef.current) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!isRunningRef.current && val.length > 0) {
      setIsRunning(true);
      isRunningRef.current = true;
      setElapsedTime(0);
      elapsedTimeRef.current = 0;
      if (mode === 'time') {
        setTimeLeft(timeOption);
        timeLeftRef.current = timeOption;
      }
    }

    // Audio feedback on new character typed
    if (val.length > typedText.length && settings.soundEnabled) {
      const addedChar = val[val.length - 1];
      const targetChar = targetText[val.length - 1];
      if (addedChar === targetChar) {
        soundSynth.playKeypress(settings.soundType);
      } else {
        if (!blindMode) {
          soundSynth.playError();
        } else {
          soundSynth.playKeypress(settings.soundType);
        }
      }
    }

    // Auto-detect keyboard input language from newly typed text
    if (autoDetectKeyboardLang && val.length > 0) {
      const addedChunk = val.slice(typedText.length) || val[val.length - 1] || val;
      const detected = detectLanguage(addedChunk) !== 'unknown' ? detectLanguage(addedChunk) : detectLanguage(val);
      if (detected !== 'unknown') {
        const langChanged = detected !== detectedKeyboardLang;
        setDetectedKeyboardLang(detected);
        const isBengaliTarget = category === 'bengali' || isBengaliText(targetTextRef.current);
        const isMismatch = (isBengaliTarget && detected === 'english') || (!isBengaliTarget && detected === 'bengali');
        if (langChanged || isMismatch || val.length === 1) {
          showLanguageNotification(detected, category, langChanged);
        }
      }
    }

    // Error detection, missed char tracking & combo streak
    if (val.length > typedText.length) {
      const newCharIdx = val.length - 1;
      const expected = targetText[newCharIdx];
      const actual = val[newCharIdx];

      if (actual) {
        const key = actual.toLowerCase();
        charFrequencyRef.current[key] = (charFrequencyRef.current[key] || 0) + 1;
      }

      if (expected && actual !== expected) {
        setErrorCount(prev => prev + 1);
        errorCountRef.current += 1;
        missedCharsRef.current[expected] = (missedCharsRef.current[expected] || 0) + 1;
        setCurrentCombo(0);
      } else if (expected && actual === expected) {
        const nextCombo = currentCombo + 1;
        setCurrentCombo(nextCombo);
        if (nextCombo > maxComboRef.current) {
          maxComboRef.current = nextCombo;
          setMaxCombo(nextCombo);
        }
        if ((nextCombo === 25 || nextCombo === 50 || nextCombo === 100 || (nextCombo > 100 && nextCombo % 50 === 0)) && nextCombo > comboMilestoneRef.current) {
          comboMilestoneRef.current = nextCombo;
          if (settings.soundEnabled) {
            soundSynth.playComboMilestone(nextCombo);
          }
        }
      }
    }

    setTypedText(val);
    typedTextRef.current = val;

    // Real-time metric calculations on each keypress
    const durationMins = Math.max(1, elapsedTimeRef.current) / 60;
    const validCharacters = val.split('').filter((char, idx) => char === targetText[idx]).length;
    const liveAccuracy = val.length > 0 ? Math.round((validCharacters / val.length) * 1000) / 10 : 100;
    const liveWpm = Math.round(((validCharacters / 5) / durationMins));
    const liveCpm = Math.round((validCharacters / durationMins));
    const liveRaw = Math.round(((val.length / 5) / durationMins));

    setCurrentWpm(liveWpm);
    setCurrentCpm(liveCpm);
    setCurrentRawWpm(liveRaw);
    setCurrentAccuracy(liveAccuracy);

    // Automatic new word streaming: as the typist approaches the end of text in Time mode,
    // automatically append fresh words so the user can type endlessly without ever running out!
    if (mode === 'time') {
      const remainingChars = targetTextRef.current.length - val.length;
      if (remainingChars < 70) {
        let additionalWords = '';
        if (category === 'bengali') {
          additionalWords = generateRandomBengaliWords(25);
        } else if (category === 'weak-keys') {
          additionalWords = generateWeakKeyDrill(userWeakKeys, 20);
        } else {
          additionalWords = generateRandomWords(35);
        }
        const updatedTarget = targetTextRef.current + ' ' + additionalWords;
        targetTextRef.current = updatedTarget;
        setTargetText(updatedTarget);
      }
    }

    // End condition for words, quote, or custom mode
    if (mode !== 'time' && val.length >= targetText.length) {
      finishTest();
    }
  };

  // Keyboard shortcut listener (Escape for restart, Alt+B for Blind Mode, language detection)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Detect keyboard language from keypress
    if (autoDetectKeyboardLang && e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const detected = detectLanguage(e.key);
      if (detected !== 'unknown') {
        const langChanged = detected !== detectedKeyboardLang;
        setDetectedKeyboardLang(detected);
        const isBengaliTarget = category === 'bengali' || isBengaliText(targetTextRef.current);
        const isMismatch = (isBengaliTarget && detected === 'english') || (!isBengaliTarget && detected === 'bengali');
        if (langChanged || isMismatch) {
          showLanguageNotification(detected, category, langChanged);
        }
      }
    }

    if (e.key === 'Escape') {
      setupNewText();
    } else if (e.altKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      const next = !blindMode;
      setBlindMode(next);
      onUpdateSettings?.({ blindMode: next });
    }
  };

  // IME Composition end handler for Bengali phonetic (Avro / Indic IME) input
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    if (!autoDetectKeyboardLang) return;
    const data = e.data || '';
    const detected = detectLanguage(data);
    if (detected !== 'unknown') {
      const langChanged = detected !== detectedKeyboardLang;
      setDetectedKeyboardLang(detected);
      const isBengaliTarget = category === 'bengali' || isBengaliText(targetTextRef.current);
      const isMismatch = (isBengaliTarget && detected === 'english') || (!isBengaliTarget && detected === 'bengali');
      if (langChanged || isMismatch) {
        showLanguageNotification(detected, category, langChanged);
      }
    }
  };

  // Global keydown listener for Alt+B so user can toggle Blind mode anywhere
  useEffect(() => {
    const handleGlobalAltKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setBlindMode(prev => {
          const next = !prev;
          onUpdateSettings?.({ blindMode: next });
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalAltKey);
    return () => window.removeEventListener('keydown', handleGlobalAltKey);
  }, [onUpdateSettings]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Render character/grapheme cluster spans with guaranteed visible spaces and clean word boundaries
  const renderCharacters = () => {
    const isBengali = category === 'bengali' || isBengaliText(targetText);
    const lines = targetText.split('\n');
    let globalIndex = 0;

    return lines.map((lineStr, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;
      const words = lineStr.split(' ');

      const renderedWords = words.map((wordStr, wordIdx) => {
        const isLastWordInLine = wordIdx === words.length - 1;

        // Render grapheme clusters of this word (keeps Bengali conjuncts & matras intact)
        const clusters = getGraphemeClusters(wordStr, isBengali ? 'bn' : 'en');
        const charElements = clusters.map((cluster, cIdx) => {
          const startIndex = globalIndex;
          const endIndex = globalIndex + cluster.length;
          globalIndex += cluster.length;

          const isFullyTyped = typedText.length >= endIndex;
          const isPartiallyTyped = typedText.length > startIndex && typedText.length < endIndex;
          const isCurrent = typedText.length >= startIndex && typedText.length < endIndex;
          const isUpcoming = typedText.length <= startIndex;

          let isCorrect = false;
          if (isFullyTyped) {
            isCorrect = typedText.slice(startIndex, endIndex) === cluster.text;
          } else if (isPartiallyTyped) {
            const typedChunk = typedText.slice(startIndex, typedText.length);
            isCorrect = cluster.text.startsWith(typedChunk);
          }

          // Ghost indicators
          const isGhostReached = isGhostModeActive && startIndex < ghostIndex;
          const isGhostCaret = isGhostModeActive && (startIndex === ghostIndex || (ghostIndex > startIndex && ghostIndex <= endIndex));

          let charClass = theme.textMuted;
          if (isFullyTyped) {
            if (blindMode && !isFinished) {
              charClass = 'text-slate-300';
            } else {
              charClass = isCorrect ? theme.correct : theme.incorrect;
            }
          } else if (isPartiallyTyped) {
            if (blindMode && !isFinished) {
              charClass = 'text-slate-300';
            } else {
              charClass = isCorrect ? 'text-amber-300 font-bold' : theme.incorrect;
            }
          }

          return (
            <span
              key={`c-${startIndex}-${cIdx}`}
              className={`relative inline transition-colors duration-75 ${charClass} ${
                isUpcoming && isGhostReached ? 'bg-cyan-500/15 text-cyan-300/80 rounded-sm' : ''
              }`}
            >
              {/* User active caret */}
              {isCurrent && (
                <span
                  ref={activeCaretRef}
                  className={`absolute left-0 bottom-0 top-0 w-[2.5px] ${theme.caret} animate-pulse pointer-events-none rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10`}
                />
              )}

              {/* Ghost racer caret & avatar */}
              {isGhostCaret && (
                <span
                  title={`Ghost PB (${bestSession?.wpm} WPM)`}
                  className="absolute left-0 bottom-0 top-0 w-[2px] bg-cyan-400 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.9)] opacity-85 z-20 transition-all duration-300"
                >
                  <span className="absolute -top-3.5 -left-1 text-[9px] font-mono leading-none text-cyan-300 bg-cyan-950/90 px-1 py-0.5 rounded border border-cyan-500/40 select-none shadow">
                    👻
                  </span>
                </span>
              )}

              {cluster.text}
            </span>
          );
        });

        // Explicit space between words with guaranteed visible width and error indicator
        let spaceElement = null;
        if (!isLastWordInLine) {
          const spaceIndex = globalIndex++;
          const isSpaceTyped = spaceIndex < typedText.length;
          const isSpaceCurrent = spaceIndex === typedText.length;
          const isSpaceCorrect = isSpaceTyped && typedText[spaceIndex] === ' ';

          // Ghost indicators on space
          const isSpaceGhostReached = isGhostModeActive && spaceIndex < ghostIndex;
          const isSpaceGhostCaret = isGhostModeActive && spaceIndex === ghostIndex;

          let spaceClass = theme.textMuted;
          if (isSpaceTyped) {
            if (blindMode && !isFinished) {
              spaceClass = 'text-slate-300';
            } else {
              spaceClass = isSpaceCorrect ? theme.correct : 'bg-rose-500/30 text-rose-400 rounded-sm';
            }
          }

          spaceElement = (
            <span
              key={`space-${spaceIndex}`}
              className={`relative inline-block w-[0.55em] text-center select-none ${spaceClass} ${
                !isSpaceTyped && isSpaceGhostReached ? 'bg-cyan-500/15 text-cyan-300/80 rounded-sm' : ''
              }`}
            >
              {isSpaceCurrent && (
                <span
                  ref={activeCaretRef}
                  className={`absolute left-0 bottom-0 top-0 w-[2.5px] ${theme.caret} animate-pulse pointer-events-none rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10`}
                />
              )}

              {isSpaceGhostCaret && (
                <span
                  title={`Ghost PB (${bestSession?.wpm} WPM)`}
                  className="absolute left-0 bottom-0 top-0 w-[2px] bg-cyan-400 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.9)] opacity-85 z-20 transition-all duration-300"
                >
                  <span className="absolute -top-3.5 -left-1 text-[9px] font-mono leading-none text-cyan-300 bg-cyan-950/90 px-1 py-0.5 rounded border border-cyan-500/40 select-none shadow">
                    👻
                  </span>
                </span>
              )}

              {isSpaceTyped && !isSpaceCorrect ? '·' : '\u00A0'}
            </span>
          );
        }

        return (
          <span key={`w-${lineIdx}-${wordIdx}`} className="inline-block whitespace-nowrap">
            {charElements}
            {spaceElement}
          </span>
        );
      });

      // Advance globalIndex for newline if not last line
      if (!isLastLine) {
        globalIndex++;
      }

      return (
        <React.Fragment key={`line-${lineIdx}`}>
          {renderedWords}
          {!isLastLine && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mode and Category Configuration Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
        {/* Modes: Time, Words, Quote */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMode('time');
              if (onClearCustomOverride) onClearCustomOverride();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'time'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time
          </button>
          <button
            onClick={() => {
              setMode('words');
              if (onClearCustomOverride) onClearCustomOverride();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'words'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Words
          </button>
          <button
            onClick={() => {
              setMode('quote');
              if (onClearCustomOverride) onClearCustomOverride();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'quote'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            Quotes
          </button>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'custom'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Custom / PDF
          </button>

          {onOpenCampaignMode && (
            <button
              onClick={onOpenCampaignMode}
              title="Campaign Mode: Levels from Normal to Extreme Hard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/30"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Campaign</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300">
                Levels
              </span>
            </button>
          )}

          {onToggleZenMode && (
            <button
              onClick={onToggleZenMode}
              title="Zen Mode: Hide all UI distractions [Alt+Z]"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                zenMode
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Zen
            </button>
          )}

          {onToggleGhostMode && (
            <button
              onClick={onToggleGhostMode}
              title={
                bestSession
                  ? `Ghost Mode: Race against your PB (${bestSession.wpm} WPM)`
                  : 'Ghost Mode: Complete a test to establish your PB ghost racer'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                isGhostModeActive
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Ghost className={`w-3.5 h-3.5 ${isGhostModeActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Ghost</span>
              {bestSession && (
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isGhostModeActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {bestSession.wpm}WPM
                </span>
              )}
            </button>
          )}

          {/* Blind Touch-Typing Mode Toggle */}
          <button
            onClick={() => {
              const next = !blindMode;
              setBlindMode(next);
              onUpdateSettings?.({ blindMode: next });
            }}
            title="Blind Mode: টাইপ করার সময় ভুল/সঠিক রঙ গোপন রেখে ১০০% ফিঙ্গার মেমোরিতে টাইপিং গঠন [Alt+B]"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              blindMode
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {blindMode ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>Blind</span>
          </button>

          {/* Keyboard Auto-Detect Language Toggle */}
          <button
            onClick={() => {
              const next = !autoDetectKeyboardLang;
              setAutoDetectKeyboardLang(next);
              onUpdateSettings?.({ autoDetectKeyboardLang: next });
              if (next) {
                setLangToast({
                  title: 'কীবোর্ড অটো-ডিটেক্ট সক্রিয় (Auto-Detect ON)',
                  message: 'টাইপ করার সাথে সাথে বাংলা বা ইংরেজি কীবোর্ড শনাক্ত করে নোটিফিকেশন প্রদর্শন করবে।',
                  type: 'info',
                  lang: detectedKeyboardLang === 'unknown' ? 'english' : detectedKeyboardLang
                });
              } else {
                setLangToast({
                  title: 'কীবোর্ড অটো-ডিটেক্ট নিষ্ক্রিয় (Auto-Detect OFF)',
                  message: 'কীবোর্ড ভাষা স্বয়ংক্রিয় শনাক্তকরণ নোটিফিকেশন বন্ধ করা হয়েছে।',
                  type: 'info',
                  lang: 'english'
                });
              }
              if (langToastTimerRef.current) window.clearTimeout(langToastTimerRef.current);
              langToastTimerRef.current = window.setTimeout(() => setLangToast(null), 3500);
            }}
            title="Auto-Detect Keyboard: কীবোর্ডের ভাষা (বাংলা/ইংরেজি) স্বয়ংক্রিয়ভাবে শনাক্ত ও নোটিফিকেশন দেখাবে"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              autoDetectKeyboardLang
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${autoDetectKeyboardLang ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>অটো ডিটেক্ট</span>
            {autoDetectKeyboardLang && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                detectedKeyboardLang === 'bengali'
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                  : detectedKeyboardLang === 'english'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
                  : 'bg-blue-500/30 text-blue-200'
              }`}>
                {detectedKeyboardLang === 'bengali' ? 'বাংলা' : detectedKeyboardLang === 'english' ? 'EN' : 'Auto'}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic sub-options based on mode */}
        <div className="flex flex-wrap items-center gap-1 font-mono">
          {mode === 'custom' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 font-semibold truncate max-w-[150px] sm:max-w-xs">
                📄 {currentCustomTitle || 'Custom Practice Text'}
              </span>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-[10px] transition-colors"
              >
                Change / PDF
              </button>
            </div>
          )}
          {mode === 'time' && (
            <div className="flex items-center gap-1 font-mono">
              {[15, 30, 60, 120].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeOption(t)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    timeOption === t
                      ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 60 ? '60s' : `${t}s`}
                </button>
              ))}

              {/* Custom Timer Button */}
              <button
                onClick={() => setIsCustomTimerModalOpen(true)}
                title="Set custom test duration"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  ![15, 30, 60, 120].includes(timeOption)
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{![15, 30, 60, 120].includes(timeOption) ? `${timeOption}s` : 'Custom'}</span>
              </button>
            </div>
          )}

          {mode === 'words' && (
            <>
              {([25, 50, 100] as WordOption[]).map(w => (
                <button
                  key={w}
                  onClick={() => setWordOption(w)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    wordOption === w
                      ? 'bg-slate-800 text-amber-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}w
                </button>
              ))}
            </>
          )}

          {mode !== 'custom' && (
            <div className="flex flex-wrap items-center gap-1 pl-2 border-l border-slate-800 ml-1">
              <button
                onClick={() => setCategory('common-words')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                  category === 'common-words'
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setCategory('bengali')}
                title="বাংলা টাইপিং মোড (ইউনিকোড ও অভ্র ফনেটিক অনুশীলন)"
                className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-colors ${
                  category === 'bengali'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>🇧🇩</span>
                <span>বাংলা</span>
              </button>
              <button
                onClick={() => setCategory('syntax-drills')}
                title="ডেভেলপার স্পেশাল কোড ও সিম্বল ড্রিল (ব্র্যাকেটস, অ্যারো, সিনট্যাক্স)"
                className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-colors ${
                  category === 'syntax-drills'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Code className="w-3 h-3 text-cyan-400" />
                <span>Syntax</span>
              </button>
              <button
                onClick={() => setCategory('weak-keys')}
                title={`দুর্বল অক্ষর ড্রিল (${userWeakKeys.slice(0, 4).join(', ')})`}
                className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-colors ${
                  category === 'weak-keys'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Crosshair className="w-3 h-3 text-rose-400" />
                <span>Weak Keys</span>
                <span className="text-[9px] font-mono opacity-80 uppercase">({userWeakKeys.slice(0, 3).join('')})</span>
              </button>
              <button
                onClick={() => setCategory('punctuation')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                  category === 'punctuation'
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Punctuation
              </button>
              <button
                onClick={() => setCategory('code')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                  category === 'code'
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Speed (WPM)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
              {currentWpm}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">words/min</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Char Rate (CPM)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
              {currentCpm}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">chars/min</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Accuracy
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
              {blindMode && !isFinished ? (
                <span className="text-purple-300 text-lg sm:text-2xl flex items-center gap-1.5 font-bold">
                  <EyeOff className="w-4 h-4 text-purple-400" />
                  Blind 🙈
                </span>
              ) : (
                <>
                  {currentAccuracy}
                  <span className="text-base text-slate-400 font-normal">%</span>
                </>
              )}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {blindMode && !isFinished ? 'Hidden in Blind' : `${errorCount} err${errorCount === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {mode === 'time' ? 'Time Remaining' : 'Elapsed Time'}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {mode === 'time' ? `${timeLeft}s` : `${elapsedTime}s`}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {mode === 'words' ? `${typedText.trim().split(/\s+/).filter(Boolean).length}/${wordOption} words` : 'live'}
          </span>
        </div>
      </div>

      {/* Speed Burst & Combo Streak Visual FX Banner */}
      {currentCombo >= 10 && isRunning && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl font-mono text-xs transition-all duration-300 animate-in zoom-in-95 ${
            currentCombo >= 100
              ? 'bg-gradient-to-r from-purple-950/90 via-pink-950/80 to-purple-950/90 border-2 border-purple-400 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
              : currentCombo >= 50
              ? 'bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-yellow-950/90 border-2 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
              : currentCombo >= 25
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/90 border border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {currentCombo >= 100 ? (
              <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
            ) : currentCombo >= 25 ? (
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            )}
            <span className="font-black uppercase tracking-wider text-xs sm:text-sm">
              {currentCombo >= 100
                ? `💥 100x ULTRA GODLIKE STREAK! (${currentCombo} Keystrokes Flawless!)`
                : currentCombo >= 50
                ? `⚡ SPEED BURST! (${currentCombo} Keystrokes Combo!)`
                : currentCombo >= 25
                ? `🔥 ${currentCombo} Keystroke Combo Streak!`
                : `⚡ ${currentCombo} Combo Streak`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Peak Streak:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-400/30">
              {Math.max(currentCombo, maxCombo)}
            </span>
          </div>
        </div>
      )}

      {/* Feature Guide Ribbons: Blind Mode, Bengali Support, Syntax Drills, Weak Keys */}
      {blindMode && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono text-purple-200 shadow-sm">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-bold text-purple-100">ব্লাইন্ড মোড (Blind Touch-Typing) সক্রিয়:</span>
            <span className="text-purple-300/80 hidden sm:inline">
              স্ক্রিনে লাল/সবুজ সংকেত ছাড়া ১০০% অনুভূতি ও মাসল মেমরিতে টাইপ করুন। টেস্ট শেষ হলে ফলাফল দেখানো হবে।
            </span>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded border border-purple-500/30 shrink-0">
            [Alt+B] Toggle
          </span>
        </div>
      )}

      {category === 'bengali' && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🇧🇩</span>
            <span className="font-bold text-emerald-100">বাংলা টাইপিং মোড:</span>
            <span className="text-emerald-300/80">
              ইউনিকোড বা অভ্র ফনেটিক (Avro Phonetic) কীবোর্ড দিয়ে সরাসরি টাইপ করুন (উদা: 'a m i' = 'আমি', 'b a n g l a' = 'বাংলা')।
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
            Avro / Unicode
          </span>
        </div>
      )}

      {category === 'syntax-drills' && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-cyan-100">ডেভেলপার কোড ও সিনট্যাক্স ড্রিল:</span>
            <span className="text-cyan-300/80">
              ব্র্যাকেটস {'{ }'}, স্কয়ার ব্র্যাকেট {'[ ]'}, অ্যারো {'=>'}, লজিক {'&&, ||'}, ও সেমিকোলন {';'} দ্রুত টাইপ করার অনুশীলন।
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shrink-0">
            Syntax Drills
          </span>
        </div>
      )}

      {category === 'weak-keys' && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold text-rose-100">দুর্বল অক্ষর অটো-ড্রিল (Weak Key Auto-Drill):</span>
            <span className="text-rose-300/80">
              আপনার কীবোর্ড বিশ্লেষণে চিহ্নিত দুর্বল কীসমূহ ({userWeakKeys.map(k => k.toUpperCase()).join(', ')}) জোরদার করার বিশেষ সেশন।
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shrink-0">
            Targeted Keys
          </span>
        </div>
      )}

      {/* Ghost Racer Live Status & Delta Bar */}
      {isGhostModeActive && bestSession && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300">
              👻
            </span>
            <span className="font-bold text-cyan-100">Ghost Racer:</span>
            <span className="text-cyan-300">Your PB ({bestSession.wpm} WPM · {bestSession.accuracy}% acc)</span>
          </div>

          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Position Delta:</span>
                {typedText.length >= ghostIndex ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    +{typedText.length - ghostIndex} chars ahead (Winning! 🏆)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    -{ghostIndex - typedText.length} chars behind
                  </span>
                )}
              </div>
            )}
            {!isRunning && (
              <span className="text-[11px] text-cyan-400/80">
                Start typing to race against your ghost!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Language Notification Toast */}
      {langToast && (
        <div
          role="alert"
          className={`flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 fade-in ${
            langToast.type === 'warning'
              ? 'bg-amber-950/85 border-amber-500/80 text-amber-100 shadow-amber-950/40'
              : langToast.type === 'success'
              ? 'bg-emerald-950/85 border-emerald-500/80 text-emerald-100 shadow-emerald-950/40'
              : 'bg-cyan-950/85 border-cyan-500/80 text-cyan-100 shadow-cyan-950/40'
          } backdrop-blur-md`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              langToast.type === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : langToast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {langToast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              ) : langToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              ) : (
                <Globe className="w-5 h-5 text-cyan-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  {langToast.title}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  langToast.type === 'warning'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                }`}>
                  {langToast.lang === 'bengali' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-sans">
                {langToast.message}
              </p>

              {/* Action buttons if mismatch occurs */}
              {langToast.type === 'warning' && (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {category === 'bengali' ? (
                    <>
                      <button
                        onClick={() => {
                          setCategory('common-words');
                          setLangToast(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors"
                      >
                        Switch to English Test
                      </button>
                      <span className="text-[11px] text-amber-300/80">
                        Avro ব্যবহারকারীদের জন্য: <strong>F12</strong> চাপুন
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setCategory('bengali');
                        setLangToast(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-colors"
                    >
                      বাংলা টেস্টে যান 🇧🇩
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setLangToast(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors shrink-0 text-sm"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Typing Surface */}
      <div
        ref={arenaContainerRef}
        onClick={focusInput}
        className={`relative p-6 sm:p-8 rounded-3xl ${theme.cardBg} cursor-text shadow-2xl transition-all duration-300 min-h-[220px] max-h-[280px] overflow-y-auto scroll-smooth flex flex-col justify-start ${
          currentCombo >= 100
            ? 'border-2 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.35)]'
            : currentCombo >= 50
            ? 'border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
            : currentCombo >= 25
            ? 'border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'border border-slate-800/80'
        }`}
      >
        {/* Invisible proxy textarea for desktop and mobile keyboard capture */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionEnd={handleCompositionEnd}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text -z-0"
          aria-label="Typing input box"
        />

        {/* Text Display */}
        <div
          className={`${
            category === 'bengali'
              ? 'font-sans tracking-normal leading-relaxed text-xl sm:text-2xl'
              : 'font-mono leading-relaxed tracking-wide text-lg sm:text-2xl'
          } select-none whitespace-pre-wrap break-normal ${
            settings.fontSize === 'large'
              ? 'text-xl sm:text-3xl leading-loose'
              : settings.fontSize === 'small'
              ? 'text-base sm:text-xl'
              : ''
          }`}
        >
          {renderCharacters()}
        </div>

        {/* Start Instruction Overlay */}
        {!isRunning && typedText.length === 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 py-2 px-4 rounded-xl border border-slate-800/60 w-fit mx-auto animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Start typing to begin test... or press Esc to reset
          </div>
        )}
      </div>

      {/* Bottom control strip */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500 font-mono hidden sm:flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Esc</kbd>
          <span>restart test</span>
        </div>

        <button
          onClick={setupNewText}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold font-mono transition-all hover:scale-105 active:scale-95 mx-auto sm:mx-0 shadow"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          Restart Test
        </button>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          {customTextOverride ? 'Custom text active' : `${category} · ${mode}`}
        </div>
      </div>

      {/* Custom Text & PDF Upload Modal */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        savedTexts={savedCustomTexts}
        onSaveToLibrary={onAddCustomText}
        onLoadTextForPractice={handleLoadCustomText}
      />

      {/* Custom Countdown Timer Modal */}
      <CustomTimerModal
        isOpen={isCustomTimerModalOpen}
        onClose={() => setIsCustomTimerModalOpen(false)}
        currentDuration={timeOption}
        onSelectDuration={(duration) => {
          setTimeOption(duration);
        }}
      />
    </div>
  );
};
