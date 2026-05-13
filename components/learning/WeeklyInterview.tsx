import React, { useState } from 'react';
import {
  Mic, CheckCircle, X, Clock, TrendingUp,
  AlertCircle, Play, Calendar, BarChart3,
} from 'lucide-react';
import MockInterview from '../MockInterview';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface WeekRecord {
  week: number;
  date: string;
  type: 'Technical' | 'HR';
  status: 'completed' | 'missed' | 'due';
  score?: number;
}

const HISTORY: WeekRecord[] = [
  { week: 8, date: 'Feb 27, 2026', type: 'Technical', status: 'due' },
  { week: 7, date: 'Feb 20, 2026', type: 'HR',         status: 'completed', score: 72 },
  { week: 6, date: 'Feb 13, 2026', type: 'Technical',  status: 'completed', score: 68 },
  { week: 5, date: 'Feb 6, 2026',  type: 'HR',         status: 'completed', score: 80 },
  { week: 4, date: 'Jan 30, 2026', type: 'Technical',  status: 'missed' },
  { week: 3, date: 'Jan 23, 2026', type: 'HR',         status: 'completed', score: 75 },
  { week: 2, date: 'Jan 16, 2026', type: 'Technical',  status: 'completed', score: 65 },
  { week: 1, date: 'Jan 9, 2026',  type: 'HR',         status: 'completed', score: 70 },
];

const completed = HISTORY.filter(h => h.status === 'completed');
const avgScore  = Math.round(completed.reduce((s, h) => s + (h.score ?? 0), 0) / completed.length);

// ─── Component ───────────────────────────────────────────────────────────────

const WeeklyInterview: React.FC = () => {
  const [showInterview, setShowInterview] = useState(false);

  if (showInterview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Interview #8</h3>
            <p className="text-xs text-gray-500">This will be counted towards your course assessment</p>
          </div>
          <button
            onClick={() => setShowInterview(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-white/10 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Exit Interview
          </button>
        </div>
        <MockInterview />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* This week's card */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-white">Week 8 · Technical Interview</p>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full animate-pulse">
                  DUE
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Feb 27, 2026 (Friday)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Deadline: Feb 28, midnight
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowInterview(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-400 hover:to-rose-500 transition-all shadow-lg shadow-red-500/30 flex-shrink-0"
          >
            <Play className="w-4 h-4" /> Start Now
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-black/20 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">
            Mandatory — missing this interview will be flagged to your exam evaluator.
            Alternates between Technical & HR every week.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Completed', val: `${completed.length}`, color: 'emerald' },
          { label: 'Missed',    val: '1',                   color: 'red' },
          { label: 'Avg Score', val: `${avgScore}%`,         color: 'neon-blue' },
          { label: 'Streak',    val: '3 wks',               color: 'yellow' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-dark-800 border border-white/10 rounded-xl px-3 py-3 text-center">
            <p className={`text-xl font-bold ${
              color === 'emerald'  ? 'text-emerald-400' :
              color === 'red'     ? 'text-red-400' :
              color === 'neon-blue' ? 'text-neon-blue' :
                                    'text-yellow-400'
            }`}>{val}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Score trend */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-neon-blue" /> Score Trend
        </h3>
        <div className="flex items-end gap-2 h-24">
          {HISTORY.slice().reverse().map((h, i) => {
            const height = h.score ? `${h.score}%` : '0%';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-700 ${
                      h.status === 'missed'    ? 'bg-red-500/40' :
                      h.status === 'due'       ? 'bg-white/10' :
                      (h.score ?? 0) >= 75     ? 'bg-emerald-500' :
                      (h.score ?? 0) >= 60     ? 'bg-neon-blue' :
                                                 'bg-yellow-500'
                    }`}
                    style={{ height }}
                  />
                </div>
                <p className="text-[9px] text-gray-600">W{h.week}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* History table */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Interview History
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {HISTORY.map((h) => (
            <div key={h.week} className="flex items-center gap-4 px-5 py-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                h.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                h.status === 'missed'   ? 'bg-red-500/20 border border-red-500/30' :
                                          'bg-yellow-500/20 border border-yellow-500/30'
              }`}>
                {h.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> :
                 h.status === 'missed'   ? <X className="w-3.5 h-3.5 text-red-400" /> :
                                           <Clock className="w-3.5 h-3.5 text-yellow-400" />}
              </div>

              <div className="flex-1">
                <p className="text-xs font-medium text-white">Week {h.week} · {h.type} Interview</p>
                <p className="text-[10px] text-gray-500">{h.date}</p>
              </div>

              <div className="text-right">
                {h.score !== undefined ? (
                  <>
                    <p className={`text-sm font-bold ${h.score >= 75 ? 'text-emerald-400' : h.score >= 60 ? 'text-neon-blue' : 'text-yellow-400'}`}>
                      {h.score}%
                    </p>
                    <p className="text-[10px] text-gray-600">Score</p>
                  </>
                ) : h.status === 'missed' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    Missed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">
                    Due
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Interview Policy</h3>
        <ul className="space-y-2">
          {[
            'Every Friday — alternates between Technical and HR rounds',
            'Must be completed by Sunday midnight of the same week',
            'Missed interviews are permanently flagged in your profile',
            'Scores are shared with exam evaluators and factor into final assessment',
            'Topic focus follows the module you are currently in',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 flex-shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeeklyInterview;
