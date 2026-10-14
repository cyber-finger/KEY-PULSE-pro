import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Lock,
  Unlock,
  Star,
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
  Skull,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Play,
  ArrowLeft,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Crosshair,
  AlertTriangle
} from 'lucide-react';
import {
  CampaignDifficulty,
  CampaignLevel,
  UserLevelProgress,
  CAMPAIGN_LEVELS,
  DIFFICULTY_CONFIG,
  loadCampaignProgress,
  saveCampaignProgress
} from '../data/campaignLevels';
import { AppSettings } from '../types';
import { soundSynth } from '../utils/audio';
import { THEMES } from '../data/themes';

interface CampaignModeProps {
  settings: AppSettings;
  onUpdateSettings?: (updates: Partial<AppSettings>) => void;
  onExitToStandardTest?: () => void;
}

export const CampaignMode: React.FC<CampaignModeProps> = ({
  settings,
  onUpdateSettings,
  onExitToStandardTest
}) => {
  const [selectedTier, setSelectedTier] = useState<CampaignDifficulty>('normal');
  const [progress, setProgress] = useState<Record<string, UserLevelProgress>>(() => loadCampaignProgress());
  const [activeLevel, setActiveLevel] = useState<CampaignLevel | null>(null);

  // Error Target configuration for Campaign Mode (lowest possible default: 0 errors max - Zero-Tolerance Flawless Mastery)
  const [campaignErrorTarget, setCampaignErrorTarget] = useState<number | 'off'>(() => {
    return settings.campaignErrorTarget !== undefined ? settings.campaignErrorTarget : 0;
  });
  const [isTargetBreached, setIsTargetBreached] = useState(false);

  // Gameplay state when a level is active
  const [typedText, setTypedText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  // Evaluation outcome
  const [resultOutcome, setResultOutcome] = useState<{
    passed: boolean;
    stars: number;
    wpm: number;
    accuracy: number;
    errors: number;
    errorTarget: number | 'off';
    targetMet: boolean;
    zeroErrorAchieved: boolean;
    unlockedNextLevel: boolean;
    nextLevelId: string | null;
  } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeCaretRef = useRef<HTMLSpanElement | null>(null);
  const arenaContainerRef = useRef<HTMLDivElement | null>(null);
  const campaignErrorTargetRef = useRef<number | 'off'>(campaignErrorTarget);
  campaignErrorTargetRef.current = campaignErrorTarget;
  const errorCountRef = useRef<number>(errorCount);
  errorCountRef.current = errorCount;

  useEffect(() => {
    if (settings.campaignErrorTarget !== undefined) {
      setCampaignErrorTarget(settings.campaignErrorTarget);
    }
  }, [settings.campaignErrorTarget]);

  const theme = THEMES[settings.theme] || THEMES.midnight;

  // Auto-scroll inside arena so active caret remains visible
  useEffect(() => {
    if (activeCaretRef.current && arenaContainerRef.current) {
      const caret = activeCaretRef.current;
      const container = arenaContainerRef.current;
      const caretTop = caret.offsetTop;
      container.scrollTop = Math.max(0, caretTop - 50);
    }
  }, [typedText]);

  // Total stars and levels cleared
  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);
  const totalCompleted = Object.values(progress).filter(p => p.completed).length;

  // Start playing a level
  const handleSelectLevel = (level: CampaignLevel) => {
    const levelProg = progress[level.id];
    if (!levelProg || !levelProg.unlocked) return;

    setActiveLevel(level);
    setTypedText('');
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setErrorCount(0);
    errorCountRef.current = 0;
    setIsTargetBreached(false);
    setShowResultModal(false);
    setResultOutcome(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleRestartActiveLevel = () => {
    if (!activeLevel) return;
    handleSelectLevel(activeLevel);
  };

  const handleBackToMap = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveLevel(null);
    setShowResultModal(false);
  };

  // Keyboard input handler during level play
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeLevel || isFinished) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!isRunning && val.length > 0) {
      setIsRunning(true);
      const now = Date.now();
      setStartTime(now);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.round((Date.now() - now) / 1000)));
      }, 250);
    }

    // Audio feedback
    if (val.length > typedText.length && settings.soundEnabled) {
      const addedChar = val[val.length - 1];
      const targetChar = activeLevel.text[val.length - 1];
      if (addedChar === targetChar) {
        soundSynth.playKeypress(settings.soundType);
      } else {
        soundSynth.playError();
      }
    }

    // Error detection & target monitoring
    if (val.length > typedText.length) {
      const newCharIdx = val.length - 1;
      const expected = activeLevel.text[newCharIdx];
      const actual = val[newCharIdx];
      if (expected && actual !== expected) {
        const nextErrors = errorCountRef.current + 1;
        setErrorCount(nextErrors);
        errorCountRef.current = nextErrors;

        if (campaignErrorTargetRef.current !== 'off' && nextErrors > campaignErrorTargetRef.current) {
          setIsTargetBreached(true);
        }
      }
    }

    setTypedText(val);

    // End condition: typed full text
    if (val.length >= activeLevel.text.length) {
      finishLevel(val);
    }
  };

  // Evaluate final level results
  const finishLevel = (finalTypedText: string) => {
    if (!activeLevel || isFinished) return;

    setIsFinished(true);
    setIsRunning(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const elapsed = Math.max(1, startTime ? (Date.now() - startTime) / 1000 : elapsedSeconds);
    const validCharacters = finalTypedText.split('').filter((c, i) => c === activeLevel.text[i]).length;
    const finalAccuracy = finalTypedText.length > 0 ? Math.round((validCharacters / finalTypedText.length) * 1000) / 10 : 100;
    const finalWpm = Math.round(((validCharacters / 5) / (elapsed / 60)));

    // Error Target assessment
    const finalErrors = errorCountRef.current;
    const currentTarget = campaignErrorTargetRef.current;
    const targetMet = currentTarget === 'off' || finalErrors <= currentTarget;
    const zeroErrorAchieved = finalErrors === 0;

    // Calculate stars
    const { starThresholds, targetWpm, targetAccuracy } = activeLevel;
    let earnedStars = 0;

    if (finalWpm >= starThresholds.threeStar.wpm && finalAccuracy >= starThresholds.threeStar.accuracy) {
      earnedStars = 3;
    } else if (finalWpm >= starThresholds.twoStar.wpm && finalAccuracy >= starThresholds.twoStar.accuracy) {
      earnedStars = 2;
    } else if (finalWpm >= starThresholds.oneStar.wpm && finalAccuracy >= starThresholds.oneStar.accuracy) {
      earnedStars = 1;
    } else if (finalWpm >= targetWpm && finalAccuracy >= targetAccuracy) {
      earnedStars = 1;
    }

    const passed = earnedStars >= 1;

    // Find next level to unlock
    const currentIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === activeLevel.id);
    const nextLevel = currentIdx >= 0 && currentIdx < CAMPAIGN_LEVELS.length - 1 ? CAMPAIGN_LEVELS[currentIdx + 1] : null;

    let unlockedNext = false;
    const nextProgress = { ...progress };

    const currentLevelProg = nextProgress[activeLevel.id] || {
      levelId: activeLevel.id,
      completed: false,
      unlocked: true,
      stars: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      attempts: 0
    };

    currentLevelProg.attempts = (currentLevelProg.attempts || 0) + 1;
    currentLevelProg.bestWpm = Math.max(currentLevelProg.bestWpm || 0, finalWpm);
    currentLevelProg.bestAccuracy = Math.max(currentLevelProg.bestAccuracy || 0, finalAccuracy);
    currentLevelProg.bestErrors = Math.min(currentLevelProg.bestErrors ?? 999, finalErrors);

    if (zeroErrorAchieved) {
      currentLevelProg.zeroErrorClear = true;
    }

    if (passed) {
      currentLevelProg.completed = true;
      currentLevelProg.stars = Math.max(currentLevelProg.stars || 0, earnedStars);
      currentLevelProg.completedAt = new Date().toISOString();

      if (nextLevel && !nextProgress[nextLevel.id]?.unlocked) {
        nextProgress[nextLevel.id] = {
          ...(nextProgress[nextLevel.id] || {
            levelId: nextLevel.id,
            completed: false,
            stars: 0,
            bestWpm: 0,
            bestAccuracy: 0,
            attempts: 0
          }),
          unlocked: true
        };
        unlockedNext = true;
      }

      // Celebratory effects
      soundSynth.playVictory();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    nextProgress[activeLevel.id] = currentLevelProg;
    setProgress(nextProgress);
    saveCampaignProgress(nextProgress);

    setResultOutcome({
      passed,
      stars: earnedStars,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      errors: finalErrors,
      errorTarget: currentTarget,
      targetMet,
      zeroErrorAchieved,
      unlockedNextLevel: unlockedNext,
      nextLevelId: nextLevel ? nextLevel.id : null
    });

    setShowResultModal(true);
  };

  const handleNextLevel = () => {
    if (!resultOutcome?.nextLevelId) return;
    const next = CAMPAIGN_LEVELS.find(l => l.id === resultOutcome.nextLevelId);
    if (next) {
      if (next.tier !== selectedTier) {
        setSelectedTier(next.tier);
      }
      handleSelectLevel(next);
    }
  };

  // Levels for current selected difficulty
  const tierLevels = CAMPAIGN_LEVELS.filter(l => l.tier === selectedTier);
  const tierCompletedCount = tierLevels.filter(l => progress[l.id]?.completed).length;
  const tierStarsCount = tierLevels.reduce((acc, l) => acc + (progress[l.id]?.stars || 0), 0);

  // Live in-progress metrics
  const liveCharacters = typedText.split('').filter((c, i) => activeLevel && c === activeLevel.text[i]).length;
  const liveElapsedMinutes = Math.max(1, elapsedSeconds) / 60;
  const liveWpm = Math.round(((liveCharacters / 5) / liveElapsedMinutes));
  const liveAccuracy = typedText.length > 0 ? Math.round((liveCharacters / typedText.length) * 1000) / 10 : 100;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* ACTIVE LEVEL PLAYING VIEW */}
      {/* ============================================================== */}
      {activeLevel ? (
        <div className="space-y-6">
          {/* Top Level Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToMap}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">লেভেল ম্যাপ</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase ${DIFFICULTY_CONFIG[activeLevel.tier].badgeColor} border`}>
                    {DIFFICULTY_CONFIG[activeLevel.tier].bengaliName}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 font-sans">
                    {activeLevel.bengaliTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeLevel.title} · {activeLevel.description}
                </p>
              </div>
            </div>

            {/* Target Requirements HUD */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>টার্গেট: <strong>{activeLevel.targetWpm} WPM</strong></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>নিখুঁত: <strong>{activeLevel.targetAccuracy}%</strong></span>
              </div>

              {/* Campaign Error Target HUD Pill & Quick Selector */}
              <div
                title="ক্যাম্পেইন ইরোর টার্গেট (সর্বনিম্ন সম্ভব: ০ ভুল - নিখুঁত টাইপিং গঠন)"
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                  isTargetBreached && campaignErrorTarget !== 'off'
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : campaignErrorTarget === 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">ইরোর টার্গেট:</span>
                <span className="sm:hidden">টার্গেট:</span>
                <strong className="font-bold">
                  {campaignErrorTarget === 'off' ? 'সীমাহীন' : `${campaignErrorTarget} max`}
                </strong>
                <div className="flex items-center gap-0.5 ml-1 border-l border-slate-800 pl-1.5">
                  {([0, 1, 2] as const).map(et => (
                    <button
                      key={et}
                      type="button"
                      onClick={() => {
                        setCampaignErrorTarget(et);
                        onUpdateSettings?.({ campaignErrorTarget: et });
                        if (errorCountRef.current > et) {
                          setIsTargetBreached(true);
                        } else {
                          setIsTargetBreached(false);
                        }
                      }}
                      title={et === 0 ? 'সর্বনিম্ন সীমা: ০ ভুল (Zero-Tolerance / Flawless - প্রস্তাবিত)' : `${et}টি সর্বোচ্চ ভুল`}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        campaignErrorTarget === et
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {et}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignErrorTarget('off');
                      onUpdateSettings?.({ campaignErrorTarget: 'off' });
                      setIsTargetBreached(false);
                    }}
                    title="সীমাহীন (কোনো ইরোর লিমিট নেই)"
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      campaignErrorTarget === 'off'
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Telemetry Gauges (5 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Current Speed</span>
                <span className="text-2xl font-black text-amber-400">{liveWpm}</span>
              </div>
              <span className="text-xs text-slate-500">WPM</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-400">{liveAccuracy}%</span>
              </div>
              <span className="text-xs text-slate-500">Acc</span>
            </div>

            {/* Error Target Telemetry Tile */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
              isTargetBreached && campaignErrorTarget !== 'off'
                ? 'bg-rose-950/50 border-rose-500/50 shadow-md shadow-rose-950/50'
                : campaignErrorTarget === 0 && errorCount === 0 && isRunning
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-rose-400" />
                  Err Target
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl font-black ${
                    campaignErrorTarget !== 'off' && errorCount > campaignErrorTarget
                      ? 'text-rose-400'
                      : errorCount === 0
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {errorCount}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {campaignErrorTarget === 'off' ? '∞' : campaignErrorTarget}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                campaignErrorTarget !== 'off' && errorCount > campaignErrorTarget
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : errorCount === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {campaignErrorTarget !== 'off' && errorCount > campaignErrorTarget
                  ? `⚠️ +${errorCount - campaignErrorTarget} Over`
                  : errorCount === 0
                  ? '🎯 0 (Flawless)'
                  : '✓ Safe'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Time Elapsed</span>
                <span className="text-2xl font-black text-cyan-400">{elapsedSeconds}s</span>
              </div>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Progress</span>
                <span className="text-2xl font-black text-slate-200">
                  {Math.round((typedText.length / activeLevel.text.length) * 100)}%
                </span>
              </div>
              <span className="text-xs text-slate-500">{typedText.length}/{activeLevel.text.length}</span>
            </div>
          </div>

          {/* Real-time Error Target Breached Notification Banner */}
          {isTargetBreached && campaignErrorTarget !== 'off' && isRunning && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                <div>
                  <span className="font-bold text-rose-100">
                    ইরোর টার্গেট ভঙ্গ হয়েছে ({errorCount} / {campaignErrorTarget} সর্বোচ্চ ভুল)!
                  </span>{' '}
                  <span className="text-rose-300/80 hidden sm:inline">
                    ক্যাম্পেইন গেমসে সেরা নির্ভুলতা ও স্পিড গড়তে ০ ভুলের টার্গেটে টাইপ করা সর্বশ্রেষ্ঠ।
                  </span>
                </div>
              </div>
              <button
                onClick={handleRestartActiveLevel}
                className="px-3 py-1.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 font-bold text-xs transition-colors border border-rose-400/50 whitespace-nowrap flex items-center gap-1 active:scale-95"
                title="রিস্টার্ট লেভেল"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিস্টার্ট [Esc]</span>
              </button>
            </div>
          )}

          {/* Typing Surface */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl relative cursor-text select-none min-h-[200px]"
          >
            <div
              ref={arenaContainerRef}
              className="max-h-[240px] overflow-y-auto font-mono text-lg sm:text-2xl leading-relaxed tracking-wide scroll-smooth"
            >
              {activeLevel.text.split('').map((char, idx) => {
                const isTyped = idx < typedText.length;
                const isCurrent = idx === typedText.length;
                const isCorrect = isTyped && typedText[idx] === char;

                let charClass = 'text-slate-500';
                if (isTyped) {
                  charClass = isCorrect ? 'text-emerald-400' : 'text-rose-400 bg-rose-500/20 rounded';
                }

                return (
                  <span key={idx} className={`relative inline-block transition-colors duration-75 ${charClass}`}>
                    {isCurrent && (
                      <span
                        ref={activeCaretRef}
                        className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-amber-400 animate-pulse rounded-full"
                      />
                    )}
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Input to capture native mobile & desktop keystrokes */}
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  handleRestartActiveLevel();
                }
              }}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="absolute -top-96 left-0 opacity-0 w-0 h-0 pointer-events-none"
            />
          </div>

          {/* Level Footer controls */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2">
            <div>
              <span>কীবোর্ড দিয়ে টাইপ করা শুরু করুন · </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Esc</kbd>
              <span> চাপলে আবার শুরু হবে</span>
            </div>
            <button
              onClick={handleRestartActiveLevel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিস্টার্ট লেভেল</span>
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* CAMPAIGN LEVEL SELECT MAP & TIERS VIEW */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
                <Gamepad2 className="w-3.5 h-3.5" />
                ক্যাম্পেইন মোড (Campaign Trials)
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                লেভেল অনুযায়ী টাইপিং অভিযান
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                সহজ থেকে ক্রমান্বয়ে কঠিন ধাপে সাজানো ৪টি মোড। একটি লেভেলে উত্তীর্ণ হলে তবেই আনলক হবে পরবর্তী চ্যালেঞ্জ। ৩ স্টার অর্জন করে নিজেকে প্রমাণ করুন!
              </p>
            </div>

            {/* Campaign Stats Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-6 shrink-0 font-mono shadow-inner">
              <div className="text-center">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">মোট স্টার</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{totalStars}/72</span>
                </div>
              </div>

              <div className="w-[1px] h-10 bg-slate-800" />

              <div className="text-center">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">সম্পন্ন লেভেল</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span>{totalCompleted}/24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Error Target Strategy Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                    ক্যাম্পেইন ইরোর টার্গেট (Campaign Error Target)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    সর্বনিম্ন সম্ভব: ০ ভুল (নিখুঁত)
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  যত কম ইরোর টার্গেট সেট করা হবে, টাইপিংয়ে তত ভালো নিয়ন্ত্রণ ও পেশাদার গতি তৈরি হবে।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">টার্গেট বাছাই করুন:</span>
              {([0, 1, 2, 3] as const).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setCampaignErrorTarget(num);
                    onUpdateSettings?.({ campaignErrorTarget: num });
                  }}
                  title={num === 0 ? 'সর্বনিম্ন সম্ভব: ০ ভুল (নিখুঁত টাইপিং - প্রস্তাবিত)' : `${num}টি সর্বোচ্চ ভুল`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    campaignErrorTarget === num
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {num === 0 ? '০ (নিখুঁত)' : `${num} ভুল`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCampaignErrorTarget('off');
                  onUpdateSettings?.({ campaignErrorTarget: 'off' });
                }}
                title="সীমাহীন (কোনো ইরোর লিমিট নেই)"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  campaignErrorTarget === 'off'
                    ? 'bg-slate-700 text-slate-200 shadow'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Off
              </button>
            </div>
          </div>

          {/* 4 Difficulty Tier Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(['normal', 'medium', 'hard', 'extreme'] as CampaignDifficulty[]).map(tierKey => {
              const cfg = DIFFICULTY_CONFIG[tierKey];
              const isSelected = selectedTier === tierKey;
              const levelsInTier = CAMPAIGN_LEVELS.filter(l => l.tier === tierKey);
              const clearedCount = levelsInTier.filter(l => progress[l.id]?.completed).length;
              const isUnlocked = levelsInTier.some(l => progress[l.id]?.unlocked);

              return (
                <button
                  key={tierKey}
                  onClick={() => setSelectedTier(tierKey)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? `${cfg.borderColor} bg-slate-900 shadow-xl ring-2 ring-amber-400/30`
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase px-2 py-0.5 rounded ${cfg.badgeColor} border`}>
                      {cfg.bengaliName}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      {isUnlocked ? (
                        <span className="text-emerald-400 text-[11px] font-bold">{clearedCount}/6</span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors font-sans">
                    {cfg.name} Mode
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {cfg.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Tier Progress Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">{DIFFICULTY_CONFIG[selectedTier].bengaliName} স্তরের লেভেলসমূহ:</span>
              <span className="text-amber-400 font-bold">{tierCompletedCount} / 6 সম্পন্ন</span>
              <span className="text-slate-500">({tierStarsCount} ★ অর্জিত)</span>
            </div>

            <div className="text-slate-400 text-[11px] hidden sm:block">
              পূর্বের লেভেল সম্পূর্ণ করলেই পরবর্তী লেভেল আনলক হবে
            </div>
          </div>

          {/* Level Cards Grid (6 levels per tier) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierLevels.map(level => {
              const levelProg = progress[level.id];
              const isUnlocked = levelProg?.unlocked || false;
              const isCompleted = levelProg?.completed || false;
              const stars = levelProg?.stars || 0;

              return (
                <div
                  key={level.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isUnlocked
                      ? isCompleted
                        ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400/80 shadow-lg'
                        : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-xl'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Level Number & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 font-mono font-black text-xs text-slate-200 flex items-center justify-center">
                          #{level.levelNumber}
                        </span>
                        {levelProg?.zeroErrorClear && (
                          <span
                            title="০টি ভুলসহ নিখুঁতভাবে এই লেভেলটি সম্পন্ন করা হয়েছে"
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>০-ভুল 🎯</span>
                          </span>
                        )}
                      </div>

                      {/* Stars earned display */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(starIndex => (
                          <Star
                            key={starIndex}
                            className={`w-4 h-4 ${
                              starIndex <= stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-100 leading-snug">
                        {level.bengaliTitle}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {level.title}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {level.description}
                      </p>
                    </div>

                    {/* Requirements Strip */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">টার্গেট স্পিড:</span>
                        <strong className="text-amber-400">&ge; {level.targetWpm} WPM</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">টার্গেট নির্ভুলতা:</span>
                        <strong className="text-emerald-400">&ge; {level.targetAccuracy}%</strong>
                      </div>
                      {levelProg?.bestWpm ? (
                        <div className="flex justify-between border-t border-slate-800/80 pt-1 text-[10px]">
                          <span className="text-slate-400">সর্বোচ্চ স্কোর:</span>
                          <span className="text-cyan-300 font-bold">{levelProg.bestWpm} WPM ({levelProg.bestAccuracy}%)</span>
                        </div>
                      ) : null}
                      {levelProg?.bestErrors !== undefined && (
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">সর্বনিম্ন ভুল:</span>
                          <span className={`font-bold ${levelProg.bestErrors === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {levelProg.bestErrors === 0 ? '০টি (নিখুঁত 🎯)' : `${levelProg.bestErrors}টি`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-2">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleSelectLevel(level)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'পুনরায় খেলুন (Replay)' : 'শুরু করুন (Start)'}</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 font-mono text-xs flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>লক করা (Locked)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VICTORY / LEVEL CLEAR MODAL */}
      {/* ============================================================== */}
      {showResultModal && resultOutcome && activeLevel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            {/* Header Icon */}
            <div className="flex justify-center">
              {resultOutcome.passed ? (
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-bounce">
                  <Trophy className="w-9 h-9" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-400 text-rose-300 flex items-center justify-center shadow-xl">
                  <XCircle className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                {activeLevel.bengaliTitle}
              </span>
              <h3 className="text-2xl font-black text-slate-100">
                {resultOutcome.passed ? 'লেভেল সম্পন্ন হয়েছে! 🎉' : 'টার্গেট পূরণ হয়নি! 💔'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {resultOutcome.passed
                  ? 'চমৎকার টাইপিং! আপনি সফলভাবে এই লেভেলের শর্ত পূরণ করেছেন।'
                  : `এই লেভেলে পাস করতে সর্বনিম্ন ${activeLevel.targetWpm} WPM ও ${activeLevel.targetAccuracy}% অ্যাকুরেসি প্রয়োজন।`}
              </p>
            </div>

            {/* Stars Awarded Animation */}
            {resultOutcome.passed && (
              <div className="flex justify-center items-center gap-2 py-1">
                {[1, 2, 3].map(sIdx => (
                  <Star
                    key={sIdx}
                    className={`w-8 h-8 transition-all ${
                      sIdx <= resultOutcome.stars
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Score Breakdown Cards (WPM, Accuracy, Errors) */}
            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">WPM</span>
                <span className={`text-xl sm:text-2xl font-black ${resultOutcome.wpm >= activeLevel.targetWpm ? 'text-amber-400' : 'text-rose-400'}`}>
                  {resultOutcome.wpm}
                </span>
                <span className="text-[9px] text-slate-500 block">টার্গেট: {activeLevel.targetWpm}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">অ্যাকুরেসি</span>
                <span className={`text-xl sm:text-2xl font-black ${resultOutcome.accuracy >= activeLevel.targetAccuracy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultOutcome.accuracy}%
                </span>
                <span className="text-[9px] text-slate-500 block">টার্গেট: {activeLevel.targetAccuracy}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">ভুল / টার্গেট</span>
                <span className={`text-xl sm:text-2xl font-black ${
                  resultOutcome.errorTarget !== 'off' && resultOutcome.errors > resultOutcome.errorTarget
                    ? 'text-rose-400'
                    : resultOutcome.errors === 0
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {resultOutcome.errors}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {resultOutcome.errorTarget === 'off' ? 'কোনো সীমা নেই' : `সীমা: ${resultOutcome.errorTarget}`}
                </span>
              </div>
            </div>

            {/* Error Target Outcome Card */}
            {resultOutcome.errorTarget !== 'off' && (
              <div className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                resultOutcome.targetMet
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  resultOutcome.targetMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {resultOutcome.targetMet ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-0.5 font-mono text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>
                      {resultOutcome.targetMet
                        ? resultOutcome.zeroErrorAchieved
                          ? '🎯 নিখুঁত ০-ভুল টার্গেট জয়! (Flawless Run)'
                          : `🎯 ইরোর টার্গেট সফল (${resultOutcome.errors}/${resultOutcome.errorTarget} ভুল)`
                        : `⚠️ ইরোর টার্গেট মিস (${resultOutcome.errors} ভুল, টার্গেট ছিল ${resultOutcome.errorTarget})`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {resultOutcome.targetMet
                      ? resultOutcome.zeroErrorAchieved
                        ? 'অসাধারণ নির্ভুলতা! কোনো ভুল ছাড়াই লেভেলটি সম্পন্ন হয়েছে যা সর্বোচ্চ টাইপিং কন্ট্রোল তৈরি করে।'
                        : 'আপনি নির্ধারিত ইরোর সীমার মধ্যে সফলভাবে লেভেলটি শেষ করেছেন।'
                      : 'ক্যাম্পেইনে নিখুঁত গতি গড়ে তুলতে সর্বনিম্ন ভুলের টার্গেটে টাইপ করা সবচেয়ে ফলপ্রসূ। আবার চেষ্টা করুন!'}
                  </p>
                </div>
              </div>
            )}

            {/* Unlocked message banner */}
            {resultOutcome.unlockedNextLevel && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>পরবর্তী লেভেল সফলভাবে আনলক হয়েছে! 🔓</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {resultOutcome.passed && resultOutcome.nextLevelId ? (
                <button
                  onClick={handleNextLevel}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
                >
                  <span>পরবর্তী লেভেল (Next Level)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}

              <button
                onClick={handleRestartActiveLevel}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>আবার চেষ্টা করুন (Retry)</span>
              </button>

              <button
                onClick={handleBackToMap}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
              >
                লেভেল ম্যাপে ফিরে যান (Level Map)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
