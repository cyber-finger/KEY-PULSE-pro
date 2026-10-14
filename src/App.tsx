import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TypingArena } from './components/TypingArena';
import { SessionResults } from './components/SessionResults';
import { ProgressDashboard } from './components/ProgressDashboard';
import { Leaderboard } from './components/Leaderboard';
import { CustomLibraryManager } from './components/CustomLibraryManager';
import { UserProfileView } from './components/UserProfileView';
import { CloudBackupModal } from './components/CloudBackupModal';
import { SettingsModal } from './components/SettingsModal';
import { LeftAdsterraSidebar, RightAdsterraSidebar, MobileAdsterraBanner } from './components/AdsterraSidebars';
import { NativeBannerAd } from './components/NativeBannerAd';
import { CampaignMode } from './components/CampaignMode';
import { TypingSession, CustomText, AppSettings, ThemeName, Badge } from './types';
import { storageService } from './services/storageService';
import { evaluateBadges } from './data/achievements';
import { THEMES } from './data/themes';
import { generateWeakKeyDrill } from './data/textLibraries';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundType: 'mechanical',
  theme: 'midnight',
  smoothCaret: true,
  showLiveWpm: true,
  showLiveCpm: true,
  showLiveAccuracy: true,
  quickRestartKey: true,
  fontSize: 'medium',
  ghostMode: true,
  blindMode: false,
  comboFx: true,
  autoDetectKeyboardLang: true,
  campaignErrorTarget: 0,
  strictErrorMode: false
};

const LOCAL_STORAGE_SETTINGS = 'keypulse_settings_v1';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'test' | 'campaign' | 'stats' | 'leaderboard' | 'library' | 'profile' | 'settings'>('test');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [completedSession, setCompletedSession] = useState<TypingSession | null>(null);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [customPracticeText, setCustomPracticeText] = useState<string | null>(null);
  const [customPracticeTitle, setCustomPracticeTitle] = useState<string | null>(null);

  // Modals
  const [cloudBackupOpen, setCloudBackupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zenMode, setZenMode] = useState<boolean>(() => settings.zenMode || false);

  // Global shortcut to toggle Zen Mode (Alt+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setZenMode(prev => {
          const next = !prev;
          handleUpdateSettings({ zenMode: next });
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load initial local data
  useEffect(() => {
    const loadedSessions = storageService.getLocalSessions();
    const loadedTexts = storageService.getLocalCustomTexts();
    setSessions(loadedSessions);
    setCustomTexts(loadedTexts);
  }, []);

  // Persist settings
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(updated));
      return updated;
    });
  };

  const handleTestComplete = (session: TypingSession) => {
    // Check for newly unlocked badges
    const currentProfile = storageService.getLocalProfile();
    const previousBadgeIds = currentProfile?.unlockedBadgeIds || [];
    const updatedSessions = [session, ...sessions];
    const badgeEval = evaluateBadges(updatedSessions, previousBadgeIds);

    setNewlyUnlockedBadges(badgeEval.newlyUnlockedBadges);

    // Save to local storage
    storageService.saveLocalSession(session);
    setSessions(updatedSessions);

    // Background sync to cloud if authenticated
    if (user) {
      storageService.syncSessionToCloud(session).catch(e => {
        console.warn('Background sync error', e);
      });
    }

    setCompletedSession(session);
  };

  const handleRestartTest = () => {
    setCompletedSession(null);
    setNewlyUnlockedBadges([]);
  };

  const handleNextTest = () => {
    setCompletedSession(null);
    setNewlyUnlockedBadges([]);
    setCustomPracticeText(null);
    setCustomPracticeTitle(null);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    try {
      localStorage.setItem('keypulse_sessions_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update sessions', e);
    }
  };

  const handleAddCustomText = (text: CustomText) => {
    storageService.saveLocalCustomText(text);
    setCustomTexts(prev => [text, ...prev]);
  };

  const handleDeleteCustomText = (id: string) => {
    storageService.deleteLocalCustomText(id);
    setCustomTexts(prev => prev.filter(t => t.id !== id));
  };

  const handleSelectPracticeText = (content: string, title: string) => {
    setCustomPracticeText(content);
    setCustomPracticeTitle(title);
    setCompletedSession(null);
    setActiveTab('test');
  };

  const handleChallengeScore = (mode: string) => {
    setActiveTab('test');
    setCompletedSession(null);
    setCustomPracticeText(null);
  };

  const handlePracticeWeakKeys = (keys: string[]) => {
    const drillText = generateWeakKeyDrill(keys, 32);
    setCustomPracticeText(drillText);
    setCustomPracticeTitle(`Weak Keys Auto-Drill (${keys.map(k => k.toUpperCase()).join(', ')})`);
    setCompletedSession(null);
    setActiveTab('test');
  };

  const handlePinBadge = async (badgeId: string) => {
    await storageService.setPinnedBadge(badgeId);
  };

  const themeConfig = THEMES[settings.theme] || THEMES.midnight;

  return (
    <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.textMain} flex flex-col font-sans transition-colors duration-200`}>
      {/* Floating Zen Mode Exit Chip */}
      {zenMode && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            onClick={() => {
              setZenMode(false);
              handleUpdateSettings({ zenMode: false });
            }}
            className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700/80 shadow-2xl flex items-center gap-2.5 text-xs font-mono backdrop-blur-md transition-all group"
            title="Exit Zen Mode (Alt+Z)"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
            <span className="font-bold">Zen Mode Active</span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-300">· [Alt+Z] Exit ✕</span>
          </button>
        </div>
      )}

      {/* Navigation Bar (Hidden in Zen Mode) */}
      {!zenMode && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => {
            setActiveTab(tab);
            if (tab === 'test') {
              setCompletedSession(null);
            }
          }}
          currentTheme={settings.theme}
          setTheme={t => handleUpdateSettings({ theme: t })}
          soundEnabled={settings.soundEnabled}
          setSoundEnabled={val => handleUpdateSettings({ soundEnabled: val })}
          onOpenCloudBackup={() => setCloudBackupOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onResetTest={() => {
            setCompletedSession(null);
            setCustomPracticeText(null);
          }}
          zenMode={zenMode}
          onToggleZenMode={() => {
            const next = !zenMode;
            setZenMode(next);
            handleUpdateSettings({ zenMode: next });
          }}
        />
      )}

      {/* 3-Column Layout with Full-Fill Left & Right Adsterra Sidebars on Desktop */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto flex items-start justify-center px-3 sm:px-4 xl:px-6 gap-4 2xl:gap-6 relative">
        {/* Left Full-Fill Sidebar Ad (Hidden in Zen Mode) */}
        {!zenMode && <LeftAdsterraSidebar />}

        {/* Central Application Workspace */}
        <main className={`w-full max-w-4xl 2xl:max-w-5xl shrink-0 mx-auto ${zenMode ? 'py-12 sm:py-20' : 'py-6 sm:py-8'} flex flex-col items-center justify-center min-w-0 transition-all`}>
        {activeTab === 'test' && (
          <div className="w-full">
            {completedSession ? (
              <SessionResults
                session={completedSession}
                newlyUnlockedBadges={newlyUnlockedBadges}
                onRestart={handleRestartTest}
                onNextTest={handleNextTest}
                onViewStats={() => {
                  setCompletedSession(null);
                  setActiveTab('stats');
                }}
                onViewLeaderboard={() => {
                  setCompletedSession(null);
                  setActiveTab('leaderboard');
                }}
                onViewProfile={() => {
                  setCompletedSession(null);
                  setActiveTab('profile');
                }}
                onPracticeWeakKeys={handlePracticeWeakKeys}
              />
            ) : (
              <div className="space-y-4">
                {customPracticeTitle && (
                  <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                    <span>Practicing: <strong>{customPracticeTitle}</strong></span>
                    <button
                      onClick={() => {
                        setCustomPracticeText(null);
                        setCustomPracticeTitle(null);
                      }}
                      className="text-slate-400 hover:text-slate-200 underline"
                    >
                      Clear custom
                    </button>
                  </div>
                )}
                <TypingArena
                  onComplete={handleTestComplete}
                  settings={settings}
                  customTextOverride={customPracticeText}
                  customTextTitle={customPracticeTitle}
                  onClearCustomOverride={() => {
                    setCustomPracticeText(null);
                    setCustomPracticeTitle(null);
                  }}
                  savedCustomTexts={customTexts}
                  onAddCustomText={handleAddCustomText}
                  onLoadCustomText={(content, title) => {
                    setCustomPracticeText(content);
                    setCustomPracticeTitle(title);
                  }}
                  zenMode={zenMode}
                  onToggleZenMode={() => {
                    const next = !zenMode;
                    setZenMode(next);
                    handleUpdateSettings({ zenMode: next });
                  }}
                  onOpenCampaignMode={() => setActiveTab('campaign')}
                  sessions={sessions}
                  onToggleGhostMode={() => {
                    handleUpdateSettings({ ghostMode: !settings.ghostMode });
                  }}
                  onUpdateSettings={handleUpdateSettings}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaign' && (
          <CampaignMode
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExitToStandardTest={() => setActiveTab('test')}
          />
        )}

        {activeTab === 'stats' && (
          <ProgressDashboard
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onExportBackup={() => setCloudBackupOpen(true)}
            onPracticeKeys={handlePracticeWeakKeys}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard onChallengeScore={handleChallengeScore} />
        )}

        {activeTab === 'library' && (
          <CustomLibraryManager
            customTexts={customTexts}
            onAddCustomText={handleAddCustomText}
            onDeleteCustomText={handleDeleteCustomText}
            onSelectForPractice={handleSelectPracticeText}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            sessions={sessions}
            onPinBadge={handlePinBadge}
            onStartTest={() => {
              setCompletedSession(null);
              setActiveTab('test');
            }}
          />
        )}

        {/* Adsterra Native Banner Unit */}
        {!zenMode && <NativeBannerAd />}
        </main>

        {/* Right Full-Fill Sidebar Ad (Hidden in Zen Mode) */}
        {!zenMode && <RightAdsterraSidebar />}
      </div>

      {/* Mobile/Tablet Ad Banner (Hidden in Zen Mode) */}
      {!zenMode && <MobileAdsterraBanner />}

      {/* Footer (Hidden in Zen Mode) */}
      {!zenMode && (
        <footer className="border-t border-slate-800/60 bg-slate-950/40 py-4 px-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span>KeyPulse Pro</span>
              <span>·</span>
              <span>Real-time WPM/CPM Telemetry</span>
              <span>·</span>
              <span>Encrypted Cloud Sync</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Esc</kbd> anytime to restart</span>
              <span>·</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Alt+Z</kbd> Zen Mode</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <CloudBackupModal
        isOpen={cloudBackupOpen}
        onClose={() => setCloudBackupOpen(false)}
        onDataRestored={() => {
          setSessions(storageService.getLocalSessions());
          setCustomTexts(storageService.getLocalCustomTexts());
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
