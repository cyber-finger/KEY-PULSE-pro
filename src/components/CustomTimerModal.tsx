import React, { useState, useEffect } from 'react';
import { Timer, X, Check, Clock, Plus, Minus, Sparkles } from 'lucide-react';

interface CustomTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDuration: number;
  onSelectDuration: (seconds: number) => void;
}

const PRESET_OPTIONS = [
  { label: '15s (Sprint)', value: 15 },
  { label: '30s (Fast)', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s (1 Minute)', value: 60, isDefault: true },
  { label: '90s (1.5 Min)', value: 90 },
  { label: '120s (2 Min)', value: 120 },
  { label: '180s (3 Min)', value: 180 },
  { label: '300s (5 Min)', value: 300 },
  { label: '600s (10 Min)', value: 600 }
];

export const CustomTimerModal: React.FC<CustomTimerModalProps> = ({
  isOpen,
  onClose,
  currentDuration,
  onSelectDuration
}) => {
  const [customSeconds, setCustomSeconds] = useState<number>(currentDuration || 60);

  useEffect(() => {
    if (isOpen) {
      setCustomSeconds(currentDuration || 60);
    }
  }, [isOpen, currentDuration]);

  if (!isOpen) return null;

  const handleAdjust = (delta: number) => {
    setCustomSeconds(prev => Math.min(3600, Math.max(5, prev + delta)));
  };

  const handleApply = (val: number) => {
    const finalVal = Math.min(3600, Math.max(5, Math.round(val)));
    onSelectDuration(finalVal);
    onClose();
  };

  const formatDisplay = (sec: number) => {
    if (sec < 60) return `${sec} seconds`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (s === 0) return `${m} minute${m > 1 ? 's' : ''}`;
    return `${m}m ${s}s`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set Custom Test Timer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Custom Test Timer
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Set any exact countdown duration (5s - 3600s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close custom timer modal"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Active Duration Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Selected Duration
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAdjust(-15)}
              title="Decrease 15 seconds"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              -15s
            </button>
            <button
              onClick={() => handleAdjust(-5)}
              title="Decrease 5 seconds"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 px-3 tracking-tight">
              {customSeconds}s
            </div>

            <button
              onClick={() => handleAdjust(5)}
              title="Increase 5 seconds"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAdjust(15)}
              title="Increase 15 seconds"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              +15s
            </button>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Equivalent: <strong className="text-slate-200">{formatDisplay(customSeconds)}</strong>
          </span>
        </div>

        {/* Direct Exact Seconds Input */}
        <div className="space-y-1.5 font-mono text-xs">
          <label htmlFor="custom-seconds-input" className="text-slate-300 font-semibold flex items-center justify-between">
            <span>Direct Seconds Input:</span>
            <span className="text-[11px] text-slate-500">Min 5s · Max 3600s</span>
          </label>
          <div className="relative">
            <input
              id="custom-seconds-input"
              type="number"
              min={5}
              max={3600}
              value={customSeconds || ''}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setCustomSeconds(val);
                else setCustomSeconds(0);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-400"
              placeholder="e.g. 60"
            />
            <span className="absolute right-3.5 top-2.5 text-slate-500 font-mono text-xs">
              sec
            </span>
          </div>
        </div>

        {/* Quick Presets Grid */}
        <div className="space-y-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
            Popular Test Durations:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_OPTIONS.map(opt => {
              const isSelected = customSeconds === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCustomSeconds(opt.value)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all text-xs font-mono ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 text-amber-400 font-bold shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div>{opt.value}s</div>
                  {opt.isDefault && (
                    <div className="text-[9px] text-amber-300/80 font-normal">Default (1m)</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setCustomSeconds(60)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Reset to 1m Default
          </button>

          <button
            type="button"
            onClick={() => handleApply(customSeconds)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply {customSeconds}s Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
