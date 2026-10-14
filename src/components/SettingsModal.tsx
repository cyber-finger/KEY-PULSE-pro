import React from 'react';
import {
  X,
  Settings as SettingsIcon,
  Volume2,
  Palette,
  Type,
  Sparkles,
  Keyboard,
  Ghost,
  Crosshair,
  Target,
  EyeOff,
  Flame,
  Globe
} from 'lucide-react';
import { AppSettings, ThemeName } from '../types';
import { THEMES } from '../data/themes';
import { soundSynth } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Typing Experience Settings</h3>
              <p className="text-xs text-slate-400 font-mono">Audio, Themes & Display Customization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs font-mono">
          {/* Zen Mode Setting */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Zen Mode (Distraction-Free)
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.zenMode}
                  onChange={e => onUpdateSettings({ zenMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Hides navigation bar, partner ads, and distracting elements while practicing. Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">Alt+Z</kbd> anytime.
            </p>
          </div>

          {/* Blind Mode Setting (ব্লাইন্ড টাচ-টাইপিং মোড) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <EyeOff className="w-4 h-4 text-purple-400" />
                Blind Touch-Typing Mode (ব্লাইন্ড মোড)
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.blindMode}
                  onChange={e => onUpdateSettings({ blindMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              টাইপ করার সময় লাল/সবুজ সংকেত গোপন রেখে ১০০% মাসল মেমোরিতে টাইপিং শেখায়। টেস্ট শেষে ফলাফল উন্মোচন হয়। শর্টকাট: <kbd className="px-1 py-0.5 rounded bg-slate-800 text-purple-300 font-mono">Alt+B</kbd>
            </p>
          </div>

          {/* Speed Burst & Combo Streak FX */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Flame className="w-4 h-4 text-amber-400" />
                Combo Streak & Visual FX (কম্বো ও স্পিড বার্স্ট এফেক্ট)
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.comboFx !== false}
                  onChange={e => onUpdateSettings({ comboFx: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              একটানা ২৫টি, ৫০টি বা ১০০টি নির্ভুল কী টাইপ করলে নিয়ন ফ্লেম অ্যানিমেশন ও পাওয়ার-আপ অডিও মাইলস্টোন সাউন্ড সক্রিয় করে।
            </p>
          </div>

          {/* Sound Profile */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Keyboard Audio Feedback
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {settings.soundEnabled && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { id: 'mechanical', name: 'Mechanical Switch' },
                  { id: 'soft', name: 'Soft Thud' },
                  { id: 'click', name: 'High Click' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onUpdateSettings({ soundType: s.id as any });
                      soundSynth.playKeypress(s.id as any);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-colors ${
                      settings.soundType === s.id
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Palette */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Palette className="w-4 h-4 text-cyan-400" />
              Color Theme & Dark Mode
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    settings.theme === t.id
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <span className={`w-3 h-3 rounded-full ${t.caret}`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Arena Font Size */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Type className="w-4 h-4 text-emerald-400" />
              Typing Text Font Size
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'Compact' },
                { id: 'medium', label: 'Balanced' },
                { id: 'large', label: 'Expansive' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontSize: f.id as any })}
                  className={`py-2 px-3 rounded-xl border text-center transition-colors ${
                    settings.fontSize === f.id
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ghost Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <Ghost className="w-4 h-4 text-cyan-400" />
                <span>Ghost Racer Mode</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Displays a translucent trail and cursor of your personal best session in real-time to race against yourself.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ghostMode: !settings.ghostMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.ghostMode !== false ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.ghostMode !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Language Auto-Detection Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Keyboard Auto-Detect & Language Alert (কীবোর্ড ভাষা অটো-ডিটেক্ট)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                টাইপ করার সময় কীবোর্ড লেআউট (বাংলা ইউনিকোড/অভ্র নাকি ইংরেজি) স্বয়ংক্রিয়ভাবে শনাক্ত করে নোটিফিকেশন দেখাবে। বাংলা টেস্টে ইংরেজি কীবোর্ড থাকলে সতর্ক করবে।
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoDetectKeyboardLang: settings.autoDetectKeyboardLang === false ? true : false })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoDetectKeyboardLang !== false ? 'bg-blue-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoDetectKeyboardLang !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Blind Touch-Typing Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <EyeOff className="w-4 h-4 text-purple-400" />
                <span>Blind Touch-Typing Mode (ব্লাইন্ড মোড)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                টাইপ করার সময় স্ক্রিনে লাল/সবুজ সংকেত ছাড়া ১০০% অনুভূতি ও মাসল মেমোরিতে টাইপ করা। টেস্ট শেষে পূর্ণাঙ্গ ফলাফল উন্মোচিত হবে।
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ blindMode: !settings.blindMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.blindMode ? 'bg-purple-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.blindMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speed Burst & Combo Streak FX Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Speed Burst & Combo Streak FX (কম্বো অ্যানিমেশন ও অডিও)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                একটানা ২৫, ৫০ বা ১০০টি কী নির্ভুলভাবে চাপলে ফ্লেম বা নিয়ন কম্বো অ্যানিমেশন এবং স্পিড বার্স্ট সাউন্ড এফেক্ট দেখায়।
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ comboFx: settings.comboFx === false ? true : false })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.comboFx !== false ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.comboFx !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Campaign Error Target Configuration (ক্যাম্পেইন ইরোর টার্গেট) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <Crosshair className="w-4 h-4 text-rose-400" />
                <span>Campaign Error Target (ক্যাম্পেইন ইরোর টার্গেট)</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {(settings.campaignErrorTarget ?? 0) === 0
                  ? '০ ভুল (নিখুঁত / সর্বনিম্ন)'
                  : settings.campaignErrorTarget === 'off'
                  ? 'Off (সীমাহীন)'
                  : `${settings.campaignErrorTarget} Max Errors`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ক্যাম্পেইন গেমসে যত কম সম্ভব ইরোর টার্গেট (যেমন: ০টি বা ১টি ভুল) সেট করলে ব্রেইন টাইপিং করার সময় প্রতিটি কী নির্ভুলভাবে চাপার সর্বোচ্চ শৃঙ্খলা বজায় রাখে। এটি স্পর্শ-টাইপিংয়ে দ্রুততম গতি অর্জনের মূল চাবিকাঠি।
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { val: 0, label: '০ (নিখুঁত)', tip: 'সর্বনিম্ন সম্ভব সীমা · ১০০% নিখুঁত নির্ভুলতা' },
                { val: 1, label: '১ ভুল', tip: 'Ultra Precision' },
                { val: 2, label: '২ ভুল', tip: 'High Discipline' },
                { val: 3, label: '৩ ভুল', tip: 'Moderate' },
                { val: 5, label: '৫ ভুল', tip: 'Relaxed' },
                { val: 'off', label: 'Off', tip: 'কোনো সীমা নেই' }
              ].map(opt => {
                const isSelected = (settings.campaignErrorTarget ?? 0) === opt.val;
                return (
                  <button
                    key={String(opt.val)}
                    onClick={() => onUpdateSettings({ campaignErrorTarget: opt.val as any })}
                    title={opt.tip}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all text-xs font-mono font-bold ${
                      isSelected
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strict Precision Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Strict Error Alert & Prompt</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ইরোর টার্গেট অতিক্রম করার সাথে সাথে রিয়েল-টাইম অ্যালার্ট ও কুইক রিস্টার্ট প্রম্পট দেখায়, যেন ভুল নিয়ে টাইপিং চালিয়ে গিয়ে খারাপ অভ্যাস তৈরি না হয়।
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ strictErrorMode: !settings.strictErrorMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.strictErrorMode ? 'bg-rose-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.strictErrorMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Shortcuts info */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-500" />
              <span>Restart active test:</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
              Esc
            </kbd>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs transition-all shadow"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
