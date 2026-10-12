import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

export const NATIVE_BANNER_SCRIPT_SRC =
  'https://pl31689374.profitableratecpmnetwork.com/c54e081f07e280d291d57c9ef613cbb9/invoke.js';
export const NATIVE_BANNER_CONTAINER_ID = 'container-c54e081f07e280d291d57c9ef613cbb9';
export const SMART_LINK_URL =
  'https://www.profitableratecpmnetwork.com/b2fsbf2ezy?key=f69668c3fadb6abd07c344b047348282';

export const NativeBannerAd: React.FC = () => {
  const [adBlocked, setAdBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Detect if client has an active ad blocker
    fetch(NATIVE_BANNER_SCRIPT_SRC, { mode: 'no-cors' })
      .catch(() => {
        setAdBlocked(true);
      });
  }, []);

  const handleOpenSmartLink = () => {
    window.open(SMART_LINK_URL, '_blank', 'noopener,noreferrer');
  };

  // Dedicated HTML document inside iframe allowing document.write and standard script execution
  const nativeBannerHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 4px;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 90px;
        overflow: hidden;
      }
      #container-c54e081f07e280d291d57c9ef613cbb9 {
        width: 100%;
        min-height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="${NATIVE_BANNER_SCRIPT_SRC}"><\/script>
    <div id="${NATIVE_BANNER_CONTAINER_ID}"></div>
  </body>
</html>`;

  return (
    <section
      aria-label="Sponsored Native Recommendations"
      className="w-full max-w-4xl 2xl:max-w-5xl mx-auto my-6 px-2 sm:px-4"
    >
      <div className="rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400/60 transition-all p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Strip */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/90 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AD
            </span>
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Sponsored Partner Recommendations
            </span>
          </div>

          <button
            onClick={handleOpenSmartLink}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Explore Partner Offers</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Native Adsterra Unit via Isolated srcDoc iframe */}
        <div className="w-full min-h-[90px] relative z-10 flex flex-col items-center justify-center">
          <iframe
            srcDoc={nativeBannerHtml}
            title="Adsterra Native Ad Banner"
            onLoad={() => setIframeLoaded(true)}
            className="w-full min-h-[100px] border-0 rounded-2xl bg-slate-950/40"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            scrolling="no"
          />

          {/* Fallback / Direct Link Card if AdBlock is active or banner is loading */}
          {adBlocked && (
            <div
              onClick={handleOpenSmartLink}
              className="w-full mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100 font-mono">
                    AdBlock Detected — Unlock Exclusive Partner Deals
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Click here to open our verified Adsterra partner reward link in a new tab.
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenSmartLink}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shrink-0 shadow"
              >
                <span>Visit Offer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Partner Strip */}
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Adsterra Native Network</span>
          </div>
          <button
            onClick={handleOpenSmartLink}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Direct Partner Link</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
