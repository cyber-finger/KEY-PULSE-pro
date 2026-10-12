import React from 'react';
import { ExternalLink, Sparkles, Flame, Gift, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const ADSTERRA_SMART_LINK =
  'https://www.profitableratecpmnetwork.com/b2fsbf2ezy?key=f69668c3fadb6abd07c344b047348282';

export const LeftAdsterraSidebar: React.FC = () => {
  const handleClick = () => {
    window.open(ADSTERRA_SMART_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      aria-label="Sponsored Content Left"
      className="hidden xl:flex flex-1 min-w-[240px] max-w-[360px] 2xl:max-w-[420px] sticky top-20 h-[calc(100vh-6rem)] shrink-0 self-start"
    >
      <div
        onClick={handleClick}
        className="group w-full h-full rounded-3xl bg-gradient-to-b from-amber-950/40 via-yellow-950/20 to-slate-900/95 border-2 border-amber-500/40 hover:border-amber-400 p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-amber-500/10 select-none relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

        {/* Top Header */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Sponsored Partner
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AD
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono text-amber-400 font-semibold shadow">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Special Partner Bonus</span>
          </div>

          <h3 className="text-lg 2xl:text-xl font-black text-slate-100 group-hover:text-amber-400 transition-colors leading-tight">
            Special Rewards & Partner Deals
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Unlock exclusive verified partner perks, trending tools, and special high-speed rewards verified by our global network.
          </p>

          {/* Animated Central Emblem */}
          <div className="py-4 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/10 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-xl shadow-amber-400/10 relative">
              <Zap className="w-10 h-10 animate-pulse" />
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] font-mono tracking-wider uppercase">
                Direct
              </div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-2 pt-1 font-mono text-xs">
            {[
              'Direct Verified Access',
              'Fast Loading & Safe Link',
              'No Registration Required',
              'Updated Daily Partner Offers'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button & Status */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80 relative z-10">
          <button
            onClick={handleClick}
            className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 group-hover:shadow-amber-400/40 transition-all active:scale-95"
          >
            <span>Claim Your Offer</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Smart Link Active
            </span>
            <span className="text-slate-400 group-hover:text-amber-300 flex items-center gap-1">
              Tap to open <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const RightAdsterraSidebar: React.FC = () => {
  const handleClick = () => {
    window.open(ADSTERRA_SMART_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      aria-label="Sponsored Content Right"
      className="hidden xl:flex flex-1 min-w-[240px] max-w-[360px] 2xl:max-w-[420px] sticky top-20 h-[calc(100vh-6rem)] shrink-0 self-start"
    >
      <div
        onClick={handleClick}
        className="group w-full h-full rounded-3xl bg-gradient-to-b from-cyan-950/40 via-blue-950/20 to-slate-900/95 border-2 border-cyan-500/40 hover:border-cyan-400 p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/10 select-none relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

        {/* Top Header */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Sponsored Partner
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              AD
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono text-cyan-400 font-semibold shadow">
            <Gift className="w-3.5 h-3.5 text-cyan-400" />
            <span>Top Rated Offers</span>
          </div>

          <h3 className="text-lg 2xl:text-xl font-black text-slate-100 group-hover:text-cyan-400 transition-colors leading-tight">
            Exclusive Digital Deals & Tools
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Discover popular trending games, software perks, and high-conversion partner destinations available today.
          </p>

          {/* Animated Central Emblem */}
          <div className="py-4 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-400/10 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-xl shadow-cyan-400/10 relative">
              <Sparkles className="w-10 h-10 animate-pulse" />
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black text-[9px] font-mono tracking-wider uppercase">
                Verified
              </div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-2 pt-1 font-mono text-xs">
            {[
              'Exclusive Partner Access',
              'Top Ranked Worldwide',
              'Multi-Platform Supported',
              'Instant Direct Redirection'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="text-[11px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button & Status */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80 relative z-10">
          <button
            onClick={handleClick}
            className="w-full py-3 px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 group-hover:shadow-cyan-400/40 transition-all active:scale-95"
          >
            <span>Explore Partner Offers</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Smart Link Active
            </span>
            <span className="text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
              Tap to open <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const MobileAdsterraBanner: React.FC = () => {
  const handleClick = () => {
    window.open(ADSTERRA_SMART_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="xl:hidden w-full max-w-4xl mx-auto px-4 my-6">
      <div
        onClick={handleClick}
        className="p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500/40 hover:border-amber-400 flex items-center justify-between gap-3 shadow-xl cursor-pointer transition-all hover:bg-slate-800"
      >
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
            AD
          </span>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-100 font-mono">Sponsored Partner Deal</p>
            <p className="text-[11px] text-slate-400">Tap to unlock exclusive verified partner offer</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shrink-0 shadow">
          <span>Explore</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
