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
  Timer
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
  getRandomPunctuation
} from '../data/textLibraries';
import { THEMES } from '../data/themes';
import { soundSynth } from '../utils/audio';
import { CustomTextModal } from './CustomTextModal';
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
  onToggleZenMode
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
      text = getRandomQuote().quote;
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
    telemetryHistoryRef.current = [];
    missedCharsRef.current = {};

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [mode, timeOption, wordOption, category, customTextOverride]);

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
        soundSynth.playError();
      }
    }

    // Error detection and missed char tracking
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
        const additionalWords = generateRandomWords(35);
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

  // Keyboard shortcut listener (Tab + Enter or Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setupNewText();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Render character spans with guaranteed visible spaces and clean word boundaries
  const renderCharacters = () => {
    const lines = targetText.split('\n');
    let globalIndex = 0;

    return lines.map((lineStr, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;
      const words = lineStr.split(' ');

      const renderedWords = words.map((wordStr, wordIdx) => {
        const isLastWordInLine = wordIdx === words.length - 1;

        // Render characters of this word
        const charElements = wordStr.split('').map((char) => {
          const charIndex = globalIndex++;
          const isTyped = charIndex < typedText.length;
          const isCurrent = charIndex === typedText.length;
          const isCorrect = isTyped && typedText[charIndex] === char;

          let charClass = theme.textMuted;
          if (isTyped) {
            charClass = isCorrect ? theme.correct : theme.incorrect;
          }

          return (
            <span
              key={`char-${charIndex}`}
              className={`relative inline-block transition-colors duration-75 ${charClass}`}
            >
              {isCurrent && (
                <span
                  ref={activeCaretRef}
                  className={`absolute left-0 bottom-0 top-0 w-[2.5px] ${theme.caret} animate-pulse pointer-events-none rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]`}
                />
              )}
              {char}
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

          let spaceClass = theme.textMuted;
          if (isSpaceTyped) {
            spaceClass = isSpaceCorrect ? theme.correct : 'bg-rose-500/30 text-rose-400 rounded-sm';
          }

          spaceElement = (
            <span
              key={`space-${spaceIndex}`}
              className={`relative inline-block w-[0.55em] text-center select-none ${spaceClass}`}
            >
              {isSpaceCurrent && (
                <span
                  ref={activeCaretRef}
                  className={`absolute left-0 bottom-0 top-0 w-[2.5px] ${theme.caret} animate-pulse pointer-events-none rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]`}
                />
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
        </div>

        {/* Dynamic sub-options based on mode */}
        <div className="flex items-center gap-1 font-mono">
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

          {mode !== 'quote' && mode !== 'custom' && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-800 ml-1">
              <button
                onClick={() => setCategory('common-words')}
                className={`px-2 py-1 rounded-md text-[11px] ${
                  category === 'common-words' ? 'text-amber-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setCategory('punctuation')}
                className={`px-2 py-1 rounded-md text-[11px] ${
                  category === 'punctuation' ? 'text-amber-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Punctuation
              </button>
              <button
                onClick={() => setCategory('code')}
                className={`px-2 py-1 rounded-md text-[11px] ${
                  category === 'code' ? 'text-amber-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
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
              {currentAccuracy}
              <span className="text-base text-slate-400 font-normal">%</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {errorCount} err{errorCount === 1 ? '' : 's'}
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

      {/* Main Typing Surface */}
      <div
        ref={arenaContainerRef}
        onClick={focusInput}
        className={`relative p-6 sm:p-8 rounded-3xl ${theme.cardBg} border border-slate-800/80 cursor-text shadow-2xl transition-all min-h-[220px] max-h-[280px] overflow-y-auto scroll-smooth flex flex-col justify-start`}
      >
        {/* Invisible proxy textarea for desktop and mobile keyboard capture */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text -z-0"
          aria-label="Typing input box"
        />

        {/* Text Display */}
        <div
          className={`font-mono leading-relaxed select-none tracking-wide text-lg sm:text-2xl whitespace-pre-wrap break-normal ${
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
