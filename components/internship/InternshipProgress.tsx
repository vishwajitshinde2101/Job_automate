import React from 'react';
import { TrendingUp, Star, Clock, CheckCircle, BarChart3, Zap, User } from 'lucide-react';

const weeklyData = [
  { week: 'W1', score: 88, attended: true,  taskScore: 92 },
  { week: 'W2', score: 84, attended: true,  taskScore: 85 },
  { week: 'W3', score: 90, attended: true,  taskScore: 88 },
  { week: 'W4', score: 76, attended: false, taskScore: 78 },
  { week: 'W5', score: 82, attended: true,  taskScore: null },
  { week: 'W6', score: null, attended: null, taskScore: null },
  { week: 'W7', score: null, attended: null, taskScore: null },
  { week: 'W8', score: null, attended: null, taskScore: null },
];

const skills = [
  { name: 'Java / Spring Boot', level: 82 },
  { name: 'REST API Design',    level: 90 },
  { name: 'React.js',           level: 70 },
  { name: 'Database (SQL)',     level: 75 },
  { name: 'Docker / DevOps',   level: 40 },
  { name: 'System Design',     level: 55 },
  { name: 'Problem Solving',   level: 80 },
  { name: 'Communication',     level: 85 },
];

const mentorRatings = [
  { category: 'Code Quality',    score: 4.2 },
  { category: 'Communication',   score: 4.6 },
  { category: 'Timeliness',      score: 3.8 },
  { category: 'Problem Solving', score: 4.4 },
  { category: 'Initiative',      score: 4.0 },
];

const InternshipProgress: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Overall Score', val: '84%',    icon: Star,        color: 'yellow' },
          { label: 'Attendance',    val: '87%',    icon: Clock,       color: 'emerald' },
          { label: 'Tasks Avg',     val: '85.75%', icon: CheckCircle, color: 'violet' },
          { label: 'Batch Rank',    val: '#3/12',  icon: TrendingUp,  color: 'blue' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-center">
            <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${
              color === 'yellow'  ? 'bg-yellow-500/10'  :
              color === 'emerald' ? 'bg-emerald-500/10' :
              color === 'violet'  ? 'bg-violet-500/10'  :
                                    'bg-neon-blue/10'
            }`}>
              <Icon className={`w-4 h-4 ${
                color === 'yellow'  ? 'text-yellow-400'  :
                color === 'emerald' ? 'text-emerald-400' :
                color === 'violet'  ? 'text-violet-400'  :
                                      'text-neon-blue'
              }`} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Weekly score chart */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" /> Weekly Performance
          </h3>
          <div className="flex items-end gap-2" style={{ height: '120px' }}>
            {weeklyData.map((w, i) => {
              const height = w.score ? `${w.score}%` : '4px';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        w.score === null ? 'bg-gray-100 dark:bg-white/5' :
                        w.score >= 85    ? 'bg-emerald-500' :
                        w.score >= 70    ? 'bg-violet-500'  :
                                           'bg-yellow-500'
                      }`}
                      style={{ height }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500">{w.week}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { color: 'bg-emerald-500', label: '85+' },
              { color: 'bg-violet-500',  label: '70–84' },
              { color: 'bg-yellow-500',  label: '<70' },
              { color: 'bg-gray-200 dark:bg-white/10', label: 'Upcoming' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor ratings */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Mentor Ratings
          </h3>
          <div className="space-y-4">
            {mentorRatings.map(({ category, score }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{category}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{score} / 5</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      score >= 4.5 ? 'bg-emerald-500' :
                      score >= 3.5 ? 'bg-violet-500'  :
                                     'bg-yellow-500'
                    }`}
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-blue" /> Skills Progress
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map(({ name, level }) => (
            <div key={name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">{name}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{level}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    level >= 80 ? 'bg-gradient-to-r from-neon-blue to-violet-500'     :
                    level >= 60 ? 'bg-gradient-to-r from-violet-500 to-indigo-500'   :
                                  'bg-gradient-to-r from-orange-500 to-yellow-500'
                  }`}
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance tracker */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" /> Standup Attendance
        </h3>
        <div className="grid grid-cols-8 gap-2 mb-3">
          {weeklyData.map((w, i) => (
            <div key={i} className="text-center">
              <div className={`w-full aspect-square rounded-lg mb-1 flex items-center justify-center ${
                w.attended === null  ? 'bg-gray-100 dark:bg-dark-900' :
                w.attended           ? 'bg-emerald-500/20 border border-emerald-500/30' :
                                       'bg-red-500/20 border border-red-500/30'
              }`}>
                {w.attended !== null && (
                  w.attended
                    ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                    : <span className="text-red-400 text-xs font-bold">✗</span>
                )}
              </div>
              <p className="text-[9px] text-gray-500">{w.week}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">4 of 5 active weeks attended · 87% attendance rate</p>
      </div>
    </div>
  );
};

export default InternshipProgress;
