import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Award,
  Quote,
  Edit3,
  UserCheck,
  Play
} from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../types';
import { ALL_BADGES, BADGE_TIER_CONFIG } from '../data/achievements';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from './EditProfileModal';

interface LeaderboardProps {
  onChallengeScore: (mode: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onChallengeScore }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(() => storageService.getLocalProfile());

  useEffect(() => {
    setLoading(true);
    const unsubscribe = storageService.subscribeLeaderboard(liveEntries => {
      setEntries(liveEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    const fresh = await storageService.fetchLeaderboard();
    setEntries(fresh);
    setCurrentProfile(storageService.getLocalProfile());
    setLoading(false);
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setCurrentProfile(updated);
    handleManualRefresh();
  };

  const filtered = entries.filter(e => {
    if (filterMode === 'all') return true;
    return e.mode.toLowerCase().includes(filterMode.toLowerCase());
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Global Hall of Fame
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Competitive Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            রিয়েল টাইপিস্টদের ভেরিফায়েড স্পিড স্কোর ও সবার পছন্দের উক্তি
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* User Leaderboard Identity Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
            {(currentProfile?.displayName || user?.displayName || 'T').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">আপনার লিডারবোর্ড নাম:</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-100 truncate">
                {currentProfile?.displayName || user?.displayName || 'Pro Typist'}
              </span>
            </div>
            {currentProfile?.favoriteQuote ? (
              <div className="text-xs text-amber-300 italic font-sans flex items-center gap-1.5 mt-1 truncate max-w-sm sm:max-w-md">
                <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">&quot;{currentProfile.favoriteQuote}&quot;</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 mt-0.5">
                এখনও কোনো উক্তি যুক্ত করেননি (উক্তি যোগ করলে সবাই দেখতে পাবে)
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs transition-all shadow hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Edit3 className="w-3.5 h-3.5" />
          ইউজারনেম ও উক্তি পরিবর্তন
        </button>
      </div>

      {/* Mode Filters Strip */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        {['all', '15s', '30s', '60s', 'quote', 'code'].map(m => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
              filterMode === m
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Highlights if at least 3 entries */}
      {filtered.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Rank 2 (Silver) */}
          <div className="sm:order-1 p-5 rounded-3xl bg-slate-900/60 border border-slate-700/80 flex flex-col justify-between text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-slate-300 font-mono text-xs font-bold uppercase">
              <Medal className="w-4 h-4 text-slate-300" />
              #2 Silver
            </div>
            <div className="my-3">
              <div className="text-3xl font-black font-mono text-slate-100">
                {filtered[1].wpm} <span className="text-sm font-normal text-slate-400">WPM</span>
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1 truncate">
                {filtered[1].displayName}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {filtered[1].cpm} CPM · {filtered[1].accuracy}% acc
              </div>
              {filtered[1].favoriteQuote && (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic font-sans flex items-center justify-center gap-1.5 truncate">
                  <Quote className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">&quot;{filtered[1].favoriteQuote}&quot;</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onChallengeScore(filtered[1].mode)}
              className="mt-2 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Challenge #{filtered[1].mode}
            </button>
          </div>

          {/* Rank 1 (Gold Champion) */}
          <div className="sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/50 flex flex-col justify-between text-center relative overflow-hidden shadow-2xl scale-105 z-10">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-mono text-xs font-bold uppercase">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              #1 World Record
            </div>
            <div className="my-3">
              <div className="text-4xl font-black font-mono text-amber-300">
                {filtered[0].wpm} <span className="text-sm font-normal text-amber-400/80">WPM</span>
              </div>
              <div className="text-base font-extrabold text-slate-100 mt-1 truncate">
                {filtered[0].displayName}
              </div>
              <div className="text-xs font-mono text-amber-400/70 mt-0.5">
                {filtered[0].cpm} CPM · {filtered[0].accuracy}% acc · {filtered[0].mode}
              </div>
              {filtered[0].favoriteQuote && (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-[11px] text-amber-200 italic font-sans flex items-center justify-center gap-1.5 truncate">
                  <Quote className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">&quot;{filtered[0].favoriteQuote}&quot;</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onChallengeScore(filtered[0].mode)}
              className="mt-2 py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-all shadow-md"
            >
              Beat #1 Score ⚡
            </button>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="sm:order-3 p-5 rounded-3xl bg-slate-900/60 border border-amber-800/40 flex flex-col justify-between text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 font-mono text-xs font-bold uppercase">
              <Medal className="w-4 h-4 text-amber-600" />
              #3 Bronze
            </div>
            <div className="my-3">
              <div className="text-3xl font-black font-mono text-slate-100">
                {filtered[2].wpm} <span className="text-sm font-normal text-slate-400">WPM</span>
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1 truncate">
                {filtered[2].displayName}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {filtered[2].cpm} CPM · {filtered[2].accuracy}% acc
              </div>
              {filtered[2].favoriteQuote && (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic font-sans flex items-center justify-center gap-1.5 truncate">
                  <Quote className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">&quot;{filtered[2].favoriteQuote}&quot;</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onChallengeScore(filtered[2].mode)}
              className="mt-2 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Challenge #{filtered[2].mode}
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-14 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-200">
              {filterMode === 'all'
                ? 'লিডারবোর্ডে এখনও কোনো স্কোর জমা হয়নি'
                : `"${filterMode}" মোডের জন্য কোনো রেকর্ড পাওয়া যায়নি`}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              নকল রেকর্ডসমূহ সরিয়ে দেওয়া হয়েছে। আপনিই প্রথম রিয়েল টেস্ট দিয়ে লিডারবোর্ডের শীর্ষে আপনার নাম ও পছন্দের উক্তি প্রকাশ করুন!
            </p>
            <div className="pt-2">
              <button
                onClick={() => onChallengeScore(filterMode === 'all' ? '60s' : filterMode)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                এখনই টেস্ট শুরু করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Typist & Quote</th>
                  <th className="py-3 px-3">Speed (WPM)</th>
                  <th className="py-3 px-3">Rate (CPM)</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((entry, index) => {
                  const isCurrentUser = user && entry.userId === user.uid;
                  return (
                    <tr
                      key={entry.id || index}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-amber-500/10 font-bold'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {index === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                          {index === 1 && <Medal className="w-4 h-4 text-slate-300" />}
                          {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                          <span
                            className={`font-black ${
                              index === 0
                                ? 'text-amber-400 text-sm'
                                : index === 1
                                ? 'text-slate-200'
                                : index === 2
                                ? 'text-amber-500'
                                : 'text-slate-500'
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {entry.photoURL ? (
                              <img
                                src={entry.photoURL}
                                alt={entry.displayName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] uppercase font-bold border border-slate-700">
                                {entry.displayName.charAt(0)}
                              </div>
                            )}
                            <span className={isCurrentUser ? 'text-amber-300 font-bold text-sm' : 'text-slate-200'}>
                              {entry.displayName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                            {entry.pinnedBadgeId && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1 font-mono"
                                title={`Pinned Badge: ${ALL_BADGES.find(b => b.id === entry.pinnedBadgeId)?.name || 'Milestone'}`}
                              >
                                <Award className="w-3 h-3" />
                                {ALL_BADGES.find(b => b.id === entry.pinnedBadgeId)?.name.split('(')[0] || 'Badge'}
                              </span>
                            )}
                          </div>

                          {/* Public Favorite Quote */}
                          {entry.favoriteQuote && (
                            <div className="text-[11px] text-amber-300/80 italic font-sans flex items-center gap-1 mt-1 pl-8 truncate max-w-xs sm:max-w-md">
                              <Quote className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
                              <span className="truncate">&quot;{entry.favoriteQuote}&quot;</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-amber-400 text-sm">
                        {entry.wpm}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-cyan-400">
                        {entry.cpm}
                      </td>
                      <td className="py-3.5 px-3 text-emerald-400 font-semibold">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {entry.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onChallengeScore(entry.mode)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                        >
                          Race
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Username & Quote Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

