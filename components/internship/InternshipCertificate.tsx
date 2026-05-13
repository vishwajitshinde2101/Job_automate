import React from 'react';
import { Award, Lock, CheckCircle, Download, Share2, Trophy, Star, Shield } from 'lucide-react';

const tasksCompleted = 4;
const totalTasks     = 8;

const requirements = [
  { label: 'Complete all 8 internship tasks',       done: false, sub: `${tasksCompleted}/8 tasks completed` },
  { label: 'Maintain 75%+ standup attendance',      done: true,  sub: 'Current: 87%' },
  { label: 'Score 70%+ avg in mentor reviews',      done: true,  sub: 'Current avg: 84%' },
  { label: 'Submit final capstone project',         done: false, sub: 'Task 8 — Due Apr 10, 2026' },
  { label: 'Pass final evaluation by mentor',       done: false, sub: 'Scheduled Apr 20, 2026' },
];

const earned = requirements.every(r => r.done);
const completedCount = requirements.filter(r => r.done).length;
const pct = Math.round((completedCount / requirements.length) * 100);

const InternshipCertificate: React.FC = () => {
  return (
    <div className="space-y-5">

      {/* Status banner */}
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
        earned
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-white/10'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          earned
            ? 'bg-yellow-500/20 border border-yellow-500/40'
            : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10'
        }`}>
          <Award className={`w-6 h-6 ${earned ? 'text-yellow-400' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {earned ? 'Certificate Earned!' : 'Certificate Locked'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {earned
              ? 'Your Internship Completion Certificate is ready to download.'
              : `Complete all requirements to unlock. (${completedCount}/${requirements.length} done)`}
          </p>
        </div>
        {earned && (
          <div className="flex gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-xl hover:bg-yellow-500/30 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-xl hover:bg-white/10 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        )}
      </div>

      {/* Certificate preview */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">

        {/* Lock overlay */}
        {!earned && (
          <div className="absolute inset-0 bg-white/85 dark:bg-dark-900/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">Complete all requirements to unlock</p>
            <div className="flex gap-1.5">
              {requirements.map((r, i) => (
                <div key={i} className={`w-8 h-1.5 rounded-full ${r.done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400">{completedCount} of {requirements.length} requirements met</p>
          </div>
        )}

        {/* Certificate design */}
        <div className="border-2 border-dashed border-yellow-500/40 rounded-xl p-8 relative bg-gradient-to-b from-yellow-500/5 to-transparent">
          {/* Corner accents */}
          <div className="absolute top-3 left-3  w-6 h-6 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-sm" />
          <div className="absolute bottom-3 left-3  w-6 h-6 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-500/50 rounded-br-sm" />

          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <Shield className="w-6 h-6 text-violet-400" />
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Certificate of Internship Completion</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">This certifies that</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Rahul Sharma</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">has successfully completed the</p>
          <p className="text-lg font-bold text-yellow-400 mb-0.5">Full Stack Java Online Internship</p>
          <p className="text-xs text-gray-400 mb-0.5">at AutoJobzy Technologies Pvt. Ltd.</p>
          <p className="text-xs text-gray-500 mb-5">Duration: Jan 28 – Apr 28, 2026 &nbsp;·&nbsp; Stipend: ₹18,000/month &nbsp;·&nbsp; Mode: Remote</p>

          <div className="flex items-center justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>

          <div className="flex items-center justify-around text-center">
            <div>
              <div className="w-20 border-t border-gray-300 dark:border-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">CEO, AutoJobzy</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono">AJ-INT-2026-FS-042</p>
              <p className="text-[10px] text-gray-400">Certificate ID</p>
            </div>
            <div>
              <div className="w-20 border-t border-gray-300 dark:border-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Internship Mentor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Requirements to Earn Certificate</h3>
        <div className="space-y-3">
          {requirements.map(({ label, done, sub }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                done
                  ? 'bg-emerald-500/20 border border-emerald-500/40'
                  : 'bg-gray-100 dark:bg-dark-900 border border-gray-200 dark:border-white/10'
              }`}>
                {done
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-[10px] mt-0.5 ${done ? 'text-emerald-400' : 'text-gray-400'}`}>{sub}</p>
              </div>
              {done && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Overall completion</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{pct}%</p>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipCertificate;
