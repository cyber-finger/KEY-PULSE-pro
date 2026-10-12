import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Zap,
  Target,
  Trophy,
  Clock,
  Trash2,
  FileDown,
  Filter,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TypingSession } from '../types';
import { KeyboardHeatmap } from './KeyboardHeatmap';

interface ProgressDashboardProps {
  sessions: TypingSession[];
  onDeleteSession?: (id: string) => void;
  onExportBackup?: () => void;
  onPracticeKeys?: (keys: string[]) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  sessions,
  onDeleteSession,
  onExportBackup,
  onPracticeKeys
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'wpm' | 'cpm' | 'accuracy'>('wpm');
  const [limitCount, setLimitCount] = useState<number>(25);

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    if (filterMode === 'all') return true;
    return s.mode.toLowerCase().includes(filterMode.toLowerCase());
  });

  // Calculate high-level stats
  const totalTests = sessions.length;
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.wpm), 0);
  const bestCpm = sessions.reduce((max, s) => Math.max(max, s.cpm), 0);
  const avgWpm = totalTests > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / totalTests) : 0;
  const avgCpm = totalTests > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.cpm, 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round((sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalTests) * 10) / 10 : 0;
  const totalCharacters = sessions.reduce((acc, s) => acc + (s.characterCount || 0), 0);
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalTimeMinutes = Math.round(totalSeconds / 60);

  // Chart data: chronological order (oldest to newest)
  const chartSessions = [...filteredSessions].reverse().slice(-limitCount);

  // Formatted data array for Recharts LineChart
  const chartData = chartSessions.map((s, idx) => {
    const d = new Date(s.timestamp);
    const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return {
      name: `#${idx + 1}`,
      sessionNum: idx + 1,
      wpm: s.wpm,
      rawWpm: s.rawWpm || s.wpm,
      cpm: s.cpm,
      accuracy: s.accuracy,
      errors: s.errorCount || 0,
      mode: s.mode,
      date: `${dateFormatted} · ${timeFormatted}`,
      timestamp: s.timestamp
    };
  });

  const avgSliceWpm = chartData.length > 0
    ? Math.round(chartData.reduce((acc, d) => acc + d.wpm, 0) / chartData.length)
    : 0;

  const maxSliceWpm = chartData.length > 0
    ? Math.max(...chartData.map(d => d.wpm))
    : 0;

  // Mode best records
  const getModeBest = (m: string) => {
    const modeList = sessions.filter(s => s.mode.toLowerCase().includes(m.toLowerCase()));
    if (modeList.length === 0) return null;
    return modeList.reduce((best, s) => s.wpm > best.wpm ? s : best, modeList[0]);
  };

  const best15s = getModeBest('15s');
  const best30s = getModeBest('30s');
  const best60s = getModeBest('60s');
  const bestQuote = getModeBest('quote');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-amber-400" />
            Analytics & Improvement History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your keystroke velocity, character rate, and accuracy evolution over time
          </p>
        </div>

        {onExportBackup && (
          <button
            onClick={onExportBackup}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            Export Data Backup
          </button>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Tests Completed</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{totalTests}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Best Speed</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
            {bestWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Peak Char Rate</div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-1">
            {bestCpm} <span className="text-xs font-normal text-slate-400">CPM</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Avg Speed</div>
          <div className="text-2xl font-extrabold font-mono text-slate-200 mt-1">
            {avgWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Avg Accuracy</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
            {avgAccuracy}<span className="text-xs font-normal text-slate-400">%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Time Practiced</div>
          <div className="text-2xl font-extrabold font-mono text-slate-200 mt-1">
            {totalTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>
      </div>

      {/* Personal Bests by Mode */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Personal Records by Discipline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">15s Sprint</span>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {best15s ? `${best15s.wpm} WPM` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {best15s ? `${best15s.accuracy}% acc · ${best15s.cpm} cpm` : 'No test yet'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">30s Standard</span>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {best30s ? `${best30s.wpm} WPM` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {best30s ? `${best30s.accuracy}% acc · ${best30s.cpm} cpm` : 'No test yet'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">60s Endurance</span>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {best60s ? `${best60s.wpm} WPM` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {best60s ? `${best60s.accuracy}% acc · ${best60s.cpm} cpm` : 'No test yet'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Quotes</span>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {bestQuote ? `${bestQuote.wpm} WPM` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {bestQuote ? `${bestQuote.accuracy}% acc · ${bestQuote.cpm} cpm` : 'No test yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Longitudinal Progress Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Progression Curve
            </h3>
            <p className="text-xs text-slate-400">
              Interactive trend of your typing metrics across historical sessions
            </p>
          </div>

          {/* Metric Selector & Limit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setChartMetric('wpm')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  chartMetric === 'wpm' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                WPM
              </button>
              <button
                onClick={() => setChartMetric('cpm')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  chartMetric === 'cpm' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CPM
              </button>
              <button
                onClick={() => setChartMetric('accuracy')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  chartMetric === 'accuracy' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Accuracy
              </button>
            </div>

            <select
              value={limitCount}
              onChange={e => setLimitCount(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={10}>Last 10 Tests</option>
              <option value={25}>Last 25 Tests</option>
              <option value={50}>Last 50 Tests</option>
              <option value={100}>Last 100 Tests</option>
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-14 text-xs font-mono text-slate-500">
            Complete typing tests to visualize your progress curve here!
          </div>
        ) : (
          <div className="w-full pt-2">
            {/* Quick Metrics Bar for Selected Range */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs font-mono">
              <div className="flex items-center gap-4 text-slate-400">
                <span>Tests plotted: <strong className="text-slate-100">{chartData.length}</strong></span>
                <span>Range Avg: <strong className="text-amber-400">{avgSliceWpm} WPM</strong></span>
                <span>Peak: <strong className="text-emerald-400">{maxSliceWpm} WPM</strong></span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Hover data points to inspect details
              </div>
            </div>

            {/* Recharts Line / Composed Chart */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />

                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    domain={chartMetric === 'accuracy' ? [70, 100] : ['dataMin - 5', 'dataMax + 10']}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5 z-50">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 text-slate-400">
                              <span className="font-bold text-amber-400">Session {d.name}</span>
                              <span className="text-[10px] text-slate-500">{d.date}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Net WPM:</span>
                              <span className="font-black text-amber-400 text-sm">{d.wpm} WPM</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Raw Speed:</span>
                              <span className="font-semibold text-slate-300">{d.rawWpm} WPM</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Keystroke Rate:</span>
                              <span className="font-semibold text-cyan-400">{d.cpm} CPM</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Accuracy:</span>
                              <span className="font-semibold text-emerald-400">{d.accuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Test Mode:</span>
                              <span className="font-semibold text-slate-300">{d.mode}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Benchmark Average WPM Reference Line */}
                  {chartMetric === 'wpm' && avgSliceWpm > 0 && (
                    <ReferenceLine
                      y={avgSliceWpm}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{
                        value: `Avg ${avgSliceWpm}`,
                        fill: '#f59e0b',
                        fontSize: 10,
                        position: 'insideTopLeft'
                      }}
                    />
                  )}

                  {/* Aesthetic Gradient Fill under the curve */}
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    fill={chartMetric === 'accuracy' ? 'url(#accGradient)' : chartMetric === 'cpm' ? 'url(#cpmGradient)' : 'url(#wpmGradient)'}
                    stroke="none"
                  />

                  {/* Primary Metric Line */}
                  <Line
                    type="monotone"
                    dataKey={chartMetric}
                    stroke={chartMetric === 'accuracy' ? '#10b981' : chartMetric === 'cpm' ? '#38bdf8' : '#f59e0b'}
                    strokeWidth={3}
                    dot={{ fill: '#0f172a', stroke: chartMetric === 'accuracy' ? '#10b981' : chartMetric === 'cpm' ? '#38bdf8' : '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#f59e0b', stroke: '#fff', strokeWidth: 2, r: 6 }}
                    isAnimationActive={true}
                  />

                  {/* Raw WPM dashed line overlay when viewing WPM */}
                  {chartMetric === 'wpm' && (
                    <Line
                      type="monotone"
                      dataKey="rawWpm"
                      name="Raw Speed"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2 px-1 border-t border-slate-800/80 pt-2">
              <span>Oldest ({chartData.length} sessions ago)</span>
              {chartMetric === 'wpm' && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> Net WPM</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-slate-400 border-b border-dashed border-slate-400 inline-block"></span> Raw WPM</span>
                </div>
              )}
              <span>Latest Session</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Keystroke & Error Distribution Heatmap */}
      <KeyboardHeatmap
        sessions={sessions}
        onPracticeKeys={onPracticeKeys}
      />

      {/* Recent Sessions Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Session History Log ({sessions.length})
          </h3>

          {/* Mode Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {['all', '15s', '30s', '60s', 'quote', 'custom'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  filterMode === m ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            No sessions match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Speed (WPM)</th>
                  <th className="py-2.5 px-3">Rate (CPM)</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Errors</th>
                  <th className="py-2.5 px-3">Duration</th>
                  {onDeleteSession && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.slice(0, 30).map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {s.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400 text-sm">
                      {s.wpm}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">
                      {s.cpm}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">
                      {s.accuracy}%
                    </td>
                    <td className="py-3 px-3 text-rose-400">
                      {s.errorCount}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {s.duration}s
                    </td>
                    {onDeleteSession && (
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteSession(s.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                          title="Delete session record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
