import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Quote,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Trophy
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldownStatus, setCooldownStatus] = useState<{
    canChange: boolean;
    remainingDays: number;
    nextAllowedDate?: string;
  }>({ canChange: true, remainingDays: 0 });

  useEffect(() => {
    if (isOpen) {
      const current = storageService.getLocalProfile();
      setProfile(current);
      setUsername(current?.displayName || '');
      setQuote(current?.favoriteQuote || '');
      setErrorMsg(null);
      setSuccessMsg(null);
      const status = storageService.getUsernameChangeStatus();
      setCooldownStatus(status);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await storageService.updateUsernameAndQuote(username, quote);
      if (!res.success) {
        setErrorMsg(res.error || 'ইউজারনেম বা উক্তি আপডেট করতে ব্যর্থ হয়েছে।');
      } else {
        setSuccessMsg('✓ ইউজারনেম ও উক্তি সফলভাবে সংরক্ষিত হয়েছে! লিডারবোর্ডে আপডেট প্রদর্শিত হবে।');
        setProfile(res.profile);
        onProfileUpdated?.(res.profile);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      setErrorMsg('সার্ভারে সংরক্ষিত হতে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const isNameModified = Boolean(profile && username.trim() !== (profile.displayName || '').trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                ইউজারনেম ও লিডারবোর্ড উক্তি সেট করুন
              </h3>
              <p className="text-xs text-slate-400">
                লিডারবোর্ডে আপনার পরিচয় ও পছন্দের উক্তি সবার সামনে প্রকাশ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Username Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                ইউজারনেম (Username)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {username.length}/25 অক্ষর
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={!cooldownStatus.canChange && isNameModified}
                placeholder="আপনার কাঙ্ক্ষিত ইউজারনেম লিখুন"
                maxLength={25}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-xs sm:text-sm font-mono text-slate-100 transition-colors focus:outline-none ${
                  !cooldownStatus.canChange
                    ? 'border-slate-800 opacity-80 cursor-not-allowed'
                    : 'border-slate-800 focus:border-amber-400'
                }`}
              />
            </div>

            {/* Cooldown feedback badge */}
            {!cooldownStatus.canChange ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>ইউজারনেম পরিবর্তন লকড:</strong> একজন ইউজার মাসে কেবল একবার ইউজারনেম পরিবর্তন করতে পারবেন।
                  পরবর্তী পরিবর্তন সম্ভব <strong>{cooldownStatus.remainingDays} দিন পর</strong> ({cooldownStatus.nextAllowedDate})।
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>মাসে একবার ইউজারনেম পরিবর্তনের সুযোগ রয়েছে। পছন্দমতো নাম নির্ধারণ করুন।</span>
              </div>
            )}
          </div>

          {/* Favorite Quote Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-cyan-400" />
                পছন্দের উক্তি (Favorite Quote / Motto)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {quote.length}/140 অক্ষর
              </span>
            </div>

            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="উদা: 'ধৈর্য ও অবিরাম চর্চায় সাফল্য আসে' বা আপনার প্রিয় কোনো বাক্য..."
              maxLength={140}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-sans text-slate-100 transition-colors focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              💡 এই উক্তিটি লিডারবোর্ডে আপনার স্কোরের নিচে যুক্ত হবে যা সবাই দেখতে পাবে। যেকোনো সময় উক্তি পরিবর্তন করতে পারবেন।
            </p>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              লিডারবোর্ড লাইভ প্রিভিউ (Live Preview)
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-500/30">
                {(username.trim() || 'You').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 truncate">
                    {username.trim() || 'Your Username'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                    YOU
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 italic flex items-center gap-1 mt-0.5 truncate">
                  <Quote className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>&quot;{quote.trim() || 'আপনার পছন্দের উক্তি এখানে দেখা যাবে...'}&quot;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || (!cooldownStatus.canChange && isNameModified)}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                'সংরক্ষণ করুন (Save)'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
