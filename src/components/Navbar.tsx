import React, { useState } from 'react';
import {
  Keyboard,
  BarChart3,
  Trophy,
  BookOpen,
  Cloud,
  CloudCheck,
  Volume2,
  VolumeX,
  Palette,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Medal,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeName } from '../types';
import { THEMES } from '../data/themes';
import { storageService } from '../services/storageService';

interface NavbarProps {
  activeTab: 'test' | 'campaign' | 'stats' | 'leaderboard' | 'library' | 'profile' | 'settings';
  setActiveTab: (tab: 'test' | 'campaign' | 'stats' | 'leaderboard' | 'library' | 'profile' | 'settings') => void;
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenCloudBackup: () => void;
  onOpenSettings: () => void;
  onResetTest?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentTheme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  onOpenCloudBackup,
  onOpenSettings,
  onResetTest,
  zenMode = false,
  onToggleZenMode
}) => {
  const { user, syncStatus } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeConfig = THEMES[currentTheme] || THEMES.midnight;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('test');
              if (onResetTest) onResetTest();
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-slate-100 font-sans">
                  Key<span className="text-amber-400">Pulse</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pro
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'test'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Test
            </button>
            <button
              onClick={() => setActiveTab('campaign')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'campaign'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>Campaign</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden lg:inline">
                Game
              </span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Stats & History
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'library'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Libraries
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Medal className="w-4 h-4" />
              Badges
            </button>
          </nav>
        </div>

        {/* Right utility toolbar */}
        <div className="flex items-center gap-2">
          {/* Zen Mode Toggle */}
          {onToggleZenMode && (
            <button
              onClick={onToggleZenMode}
              title="Zen Mode: Hide navigation and sidebars [Alt+Z]"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 focus:outline-none border ${
                zenMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-slate-800'
              }`}
              aria-label="Toggle Zen Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Zen</span>
            </button>
          )}

          {/* Quick Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute keyboard audio' : 'Enable click sounds'}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              title="Change theme palette"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
              aria-label="Change Theme"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-mono capitalize">
                {currentTheme}
              </span>
            </button>

            {themeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setThemeDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Theme
                </div>
                {Object.values(THEMES).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      currentTheme === t.id ? 'text-amber-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="flex items-center gap-1">
                      {t.isDark ? <Moon className="w-3 h-3 text-slate-500" /> : <Sun className="w-3 h-3 text-amber-400" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Sync & User Profile Button */}
          <button
            onClick={onOpenCloudBackup}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
            title="Cloud Backup & Synchronization"
          >
            {user ? (
              <>
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <CloudCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                  {storageService.getLocalProfile()?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Synced'}
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Cloud Sync</span>
              </>
            )}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            title="Typing Preferences"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          <button
            onClick={() => {
              setActiveTab('test');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeTab === 'test' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Typing Test
          </button>
          <button
            onClick={() => {
              setActiveTab('campaign');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              activeTab === 'campaign' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>Campaign (গেম মোড)</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Levels
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('stats');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeTab === 'stats' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Statistics & Charts
          </button>
          <button
            onClick={() => {
              setActiveTab('leaderboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeTab === 'leaderboard' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Global Leaderboard
          </button>
          <button
            onClick={() => {
              setActiveTab('library');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeTab === 'library' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Custom Text Libraries
          </button>
          <button
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeTab === 'profile' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-300'
            }`}
          >
            <Medal className="w-4 h-4" />
            Badges & Profile
          </button>
        </div>
      )}
    </header>
  );
};
