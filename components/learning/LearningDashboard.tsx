import React from 'react';
import {
  BookOpen, Calendar, CheckSquare, Mic, Trophy,
  Award, TrendingUp, Clock, ChevronRight, AlertCircle,
  Target, Zap,
} from 'lucide-react';
import { SubTab, ENROLLED_COURSE } from '../LearningModule';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  setActiveSubTab: (tab: SubTab) => void;
}

// ─── Recent activity ──────────────────────────────────────────────────────────

const RECENT_ACTIVITY = [
  { icon: CheckSquare, color: 'text-emerald-400', msg: 'Lesson completed: Spring Data JPA', time: '2 hours ago' },
  { icon: Trophy,      color: 'text-yellow-400',  msg: 'Exam 1 result published — 78/100 Passed', time: 'Mar 16, 2026' },
  { icon: CheckSquare, color: 'text-emerald-400', msg: 'Task 1 reviewed — "Excellent!"', time: 'Mar 10, 2026' },
  { icon: Mic,         color: 'text-neon-blue',   msg: 'Weekly Interview #7 completed — 72%', time: 'Feb 20, 2026' },
  { icon: BookOpen,    color: 'text-neon-purple',  msg: 'Module 2 unlocked', time: 'Feb 15, 2026' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const LearningDashboard: React.FC<Props> = ({ setActiveSubTab }) => {
  const progress = ENROLLED_COURSE.progress;

  return (
    <div className="space-y-5">

      {/* ── Weekly interview alert ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl">
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300 flex-1">
          <span className="font-semibold">Weekly Interview Due!</span> Complete before Sunday Feb 28 midnight.
        </p>
        <button
          onClick={() => setActiveSubTab('weekly-interview')}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-white font-semibold transition-colors"
        >
          Start Now <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Stat widgets ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {/* Course progress */}
        <div
          onClick={() => setActiveSubTab('my-courses')}
          className="bg-dark-800 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">{progress}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Course Progress</p>
          <div className="mt-3 w-full h-1.5 bg-dark-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">{ENROLLED_COURSE.currentModule}</p>
        </div>

        {/* Next exam */}
        <div
          onClick={() => setActiveSubTab('exams')}
          className="bg-dark-800 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-neon-blue/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-neon-blue" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-neon-blue transition-colors" />
          </div>
          <p className="text-lg font-bold text-white">Apr 15</p>
          <p className="text-xs text-gray-400 mt-0.5">Next Exam · Exam 2</p>
          <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-lg w-fit">
            <Clock className="w-3 h-3 text-neon-blue" />
            <span className="text-[10px] text-neon-blue font-medium">52 days away</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">AutoJobzy Testing Center, Pune</p>
        </div>

        {/* Tasks pending */}
        <div
          onClick={() => setActiveSubTab('tasks')}
          className="bg-dark-800 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-yellow-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-yellow-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-xs text-gray-400 mt-0.5">Tasks Pending</p>
          <p className="text-[10px] text-yellow-400 mt-3 font-medium">Next due: Mar 20, 2026</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Implement JWT Auth System</p>
        </div>

        {/* Weekly interview */}
        <div
          onClick={() => setActiveSubTab('weekly-interview')}
          className="bg-dark-800 border border-red-500/25 rounded-2xl p-5 cursor-pointer hover:border-red-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">DUE</span>
          </div>
          <p className="text-base font-bold text-white">This Friday</p>
          <p className="text-xs text-gray-400 mt-0.5">Weekly Interview #8</p>
          <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-red-400 font-medium">Mandatory · by Sunday</span>
          </div>
        </div>

        {/* Last exam score */}
        <div
          onClick={() => setActiveSubTab('exams')}
          className="bg-dark-800 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">78<span className="text-gray-500 text-base">/100</span></p>
          <p className="text-xs text-gray-400 mt-0.5">Exam 1 Score</p>
          <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">Passed · Mar 15, 2026</span>
          </div>
        </div>

        {/* Certificate */}
        <div
          onClick={() => setActiveSubTab('certificates')}
          className="bg-dark-800 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-yellow-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
          </div>
          <p className="text-base font-bold text-gray-400">Not Earned</p>
          <p className="text-xs text-gray-600 mt-0.5">Certificate</p>
          <div className="mt-3 w-full h-1 bg-dark-900 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500/50 rounded-full" style={{ width: '33%' }} />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">1 of 3 exams passed</p>
        </div>
      </div>

      {/* ── Progress breakdown ── */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Course Progress Breakdown
          </h3>
          <span className="text-xs text-emerald-400 font-medium">{ENROLLED_COURSE.title}</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Module 1: Core Java Fundamentals',   pct: 100, status: 'Completed' },
            { label: 'Module 2: Spring Boot Essentials',   pct: 50,  status: 'In Progress' },
            { label: 'Module 3: Advanced Architecture',    pct: 0,   status: 'Locked' },
            { label: 'Module 4: Capstone Project',         pct: 0,   status: 'Locked' },
          ].map(({ label, pct, status }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-300">{label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  status === 'Completed'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  status === 'In Progress' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' :
                                             'bg-white/5 text-gray-600 border border-white/10'
                }`}>{status}</span>
              </div>
              <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-neon-blue' : 'bg-white/10'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map(({ icon: Icon, color, msg, time }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-200">{msg}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
