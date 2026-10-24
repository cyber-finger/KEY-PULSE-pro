import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Zap,
  Flame,
  Sparkles,
  BookOpen,
  Feather,
  Scroll,
  BookMarked,
  Target,
  CheckCircle2,
  Layers,
  Shield,
  Crosshair,
  Compass,
  Code2,
  Quote,
  Lock,
  Check,
  Pin,
  Star,
  Medal,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { Badge, TypingSession, UserProfile, BadgeCategory, BadgeTier } from '../types';
import { ALL_BADGES, BADGE_TIER_CONFIG, getBadgeProgress, calculateTotalWordsTyped } from '../data/achievements';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from './EditProfileModal';

interface UserProfileViewProps {
  sessions: TypingSession[];
  onPinBadge: (badgeId: string) => void;
  onStartTest: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  sessions,
  onPinBadge,
  onStartTest
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(() => storageService.getLocalProfile());
  const totalWords = calculateTotalWordsTyped(sessions);
  const testsCompleted = sessions.length;
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.wpm), 0);
  const bestCpm = sessions.reduce((max, s) => Math.max(max, s.cpm), 0);
  const avgAccuracy = testsCompleted > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / testsCompleted * 10) / 10
    : 0;

  // Unlocked badge IDs
  const unlockedIds = new Set(localProfile?.unlockedBadgeIds || []);
  // In case localProfile hasn't synced yet, evaluate on the fly
  ALL_BADGES.forEach(badge => {
    const prog = getBadgeProgress(badge, sessions, totalWords, testsCompleted, bestWpm);
    if (prog.isUnlocked) {
      unlockedIds.add(badge.id);
    }
  });

  const totalPoints = ALL_BADGES.filter(b => unlockedIds.has(b.id)).reduce((acc, b) => acc + b.points, 0);

  // User Level: Level 1 starts at 0 pts, every 100 pts is a level
  const userLevel = Math.max(1, Math.floor(totalPoints / 100) + 1);
  const currentLevelProgress = totalPoints % 100;

  // User Rank Title
  const getRankTitle = (lvl: number, wpm: number) => {
    if (wpm >= 120 || lvl >= 15) return 'Grandmaster Typist';
    if (wpm >= 100 || lvl >= 10) return 'Century Velocity Master';
    if (wpm >= 80 || lvl >= 6) return 'Keystroke Virtuoso';
    if (wpm >= 60 || lvl >= 3) return 'Journeyman Typist';
    return 'Apprentice Scribe';
  };

  const rankTitle = getRankTitle(userLevel, bestWpm);
  const pinnedBadge = ALL_BADGES.find(b => b.id === (localProfile?.pinnedBadgeId || 'speed_century_100')) || ALL_BADGES[0];

  // Filter badges
  const filteredBadges = ALL_BADGES.filter(b => {
    const isUnlocked = unlockedIds.has(b.id);
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (selectedStatus === 'unlocked' && !isUnlocked) return false;
    if (selectedStatus === 'locked' && isUnlocked) return false;
    return true;
  });

  // Dynamic Lucide icon lookup
  const renderBadgeIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Zap': return <Zap className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Award': return <Award className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Feather': return <Feather className={className} />;
      case 'Scroll': return <Scroll className={className} />;
      case 'BookMarked': return <BookMarked className={className} />;
      case 'Target': return <Target className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Code2': return <Code2 className={className} />;
      case 'Quote': return <Quote className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const handleCopyProfileSummary = () => {
    const text = `🏆 KeyPulse Typist Profile: ${localProfile?.displayName || user?.displayName || 'Typist'}
⭐ Level ${userLevel} ${rankTitle}
⚡ Best Speed: ${bestWpm} WPM (${bestCpm} CPM)
📜 Total Words Typed: ${totalWords.toLocaleString()}
🎖️ Badges Unlocked: ${unlockedIds.size}/${ALL_BADGES.length} (${totalPoints} pts)`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Profile Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* User Identity & Level */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Typist'}
                  className="w-20 h-20 rounded-2xl border-2 border-amber-400/60 shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-amber-400" />
                  </div>
                </div>
              )}
              {/* Level Badge Overlay */}
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black font-mono shadow border border-amber-300">
                LVL {userLevel}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  {localProfile?.displayName || user?.displayName || 'Pro Typist'}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-mono transition-colors flex items-center gap-1 shadow-sm"
                  title="ইউজারনেম ও উক্তি পরিবর্তন করুন"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>এডিট</span>
                </button>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                  {rankTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user?.email ? user.email : 'Local Account · Cloud Sync Active'}
              </p>

              {/* Public Favorite Quote */}
              <div className="pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 max-w-sm sm:max-w-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-200/90 italic truncate font-sans">
                      {localProfile?.favoriteQuote ? `"${localProfile.favoriteQuote}"` : 'কোনো প্রিয় উক্তি সেট করা হয়নি'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline shrink-0"
                  >
                    {localProfile?.favoriteQuote ? 'উক্তি পরিবর্তন' : '+ উক্তি দিন'}
                  </button>
                </div>
              </div>

              {/* Level XP Bar */}
              <div className="pt-2 w-56 sm:w-64">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Level {userLevel}</span>
                  <span>{currentLevelProgress}/100 XP to Lvl {userLevel + 1}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${currentLevelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Pinned Badge Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {pinnedBadge && (
              <div
                className={`p-3 rounded-2xl border ${BADGE_TIER_CONFIG[pinnedBadge.tier].border} ${BADGE_TIER_CONFIG[pinnedBadge.tier].bg} flex items-center gap-3 shadow-md`}
                title="Your Featured / Pinned Badge"
              >
                <div className={`p-2 rounded-xl ${BADGE_TIER_CONFIG[pinnedBadge.tier].badgeBg}`}>
                  {renderBadgeIcon(pinnedBadge.icon, 'w-5 h-5')}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono font-bold text-amber-400">
                    <Pin className="w-3 h-3 rotate-45" />
                    Pinned Badge
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate max-w-[130px]">
                    {pinnedBadge.name}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCopyProfileSummary}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Star className="w-3.5 h-3.5 text-amber-400" />}
              {copiedShare ? 'Copied Stats!' : 'Share Profile'}
            </button>
          </div>
        </div>

        {/* High-level Achievement Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Milestones Unlocked</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {unlockedIds.size} <span className="text-xs font-normal text-slate-500">/ {ALL_BADGES.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Achievement Points</span>
            <div className="text-2xl font-black font-mono text-yellow-400 mt-1">
              {totalPoints} <span className="text-xs font-normal text-slate-500">PTS</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Words Typed</span>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              {totalWords.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Peak Net Velocity</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {bestWpm} <span className="text-xs font-normal text-slate-500">WPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Milestones Section Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" />
              Typing Milestones & Achievements
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unlock prestigious badges as your speed, endurance, and precision advance
            </p>
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({ALL_BADGES.length})
            </button>
            <button
              onClick={() => setSelectedStatus('unlocked')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'unlocked' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlocked ({unlockedIds.size})
            </button>
            <button
              onClick={() => setSelectedStatus('locked')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'locked' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Locked ({ALL_BADGES.length - unlockedIds.size})
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'speed', label: 'Speed & Velocity (WPM)' },
            { id: 'volume', label: 'Volume & Endurance' },
            { id: 'accuracy', label: 'Precision & Accuracy' },
            { id: 'special', label: 'Special Disciplines' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                selectedCategory === cat.id
                  ? 'border-amber-400/80 bg-amber-400/10 text-amber-400 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map(badge => {
          const isUnlocked = unlockedIds.has(badge.id);
          const isPinned = localProfile?.pinnedBadgeId === badge.id;
          const tier = BADGE_TIER_CONFIG[badge.tier];
          const progress = getBadgeProgress(badge, sessions, totalWords, testsCompleted, bestWpm);

          return (
            <div
              key={badge.id}
              className={`relative p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between shadow-lg group ${
                isUnlocked
                  ? `${tier.bg} ${tier.border} ${tier.glow}`
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-90'
              }`}
            >
              <div>
                {/* Header: Icon, Tier Pill, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-2xl ${isUnlocked ? tier.badgeBg : 'bg-slate-900 text-slate-600'} transition-transform group-hover:scale-105 shadow-inner`}>
                    {renderBadgeIcon(badge.icon, 'w-6 h-6')}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${tier.border} ${tier.badgeBg}`}>
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      +{badge.points} PTS
                    </span>
                  </div>
                </div>

                {/* Badge Name & Description */}
                <div className="mt-3.5 space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {badge.name}
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-3">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Unlocked!
                    </span>

                    <button
                      onClick={() => onPinBadge(badge.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        isPinned
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Pin className="w-3 h-3" />
                      {isPinned ? 'Pinned' : 'Pin to Profile'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        In Progress
                      </span>
                      <span>
                        {progress.current} / {progress.target} ({progress.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-slate-600 rounded-full transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Practice CTA */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200">Want to unlock the Century Club (100 WPM) or 10K words?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Regular deliberate practice with diverse text libraries builds finger independence and speed.
          </p>
        </div>
        <button
          onClick={onStartTest}
          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          Start Next Test
        </button>
      </div>

      {/* Edit Username & Quote Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={updated => setLocalProfile(updated)}
      />
    </div>
  );
};
