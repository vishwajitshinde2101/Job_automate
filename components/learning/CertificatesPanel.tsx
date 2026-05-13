import React from 'react';
import { Award, CheckCircle, Lock, Trophy, Star, Download, Share2 } from 'lucide-react';
import { ENROLLED_COURSE } from '../LearningModule';

// ─── Component ───────────────────────────────────────────────────────────────

const CertificatesPanel: React.FC = () => {
  const examsPassedCount = 1; // mock: only Exam 1 passed
  const totalExams = 3;
  const earned = examsPassedCount === totalExams;

  return (
    <div className="space-y-5">

      {/* Status banner */}
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
        earned
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-dark-800 border-white/10'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          earned ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10'
        }`}>
          <Award className={`w-6 h-6 ${earned ? 'text-yellow-400' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">
            {earned ? 'Certificate Earned!' : 'Certificate Locked'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {earned
              ? `Congratulations! Your ${ENROLLED_COURSE.title} certificate is ready.`
              : `Complete all 3 exams to unlock your certificate. (${examsPassedCount}/${totalExams} passed)`}
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
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
        {!earned && (
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium text-sm">Complete all 3 exams to unlock</p>
            <div className="flex gap-1.5">
              {Array.from({ length: totalExams }).map((_, i) => (
                <div key={i} className={`w-8 h-1.5 rounded-full ${i < examsPassedCount ? 'bg-emerald-500' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-600">{examsPassedCount} of {totalExams} exams passed</p>
          </div>
        )}

        {/* Certificate design */}
        <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-8 relative bg-gradient-to-b from-yellow-500/5 to-transparent">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-yellow-500/40 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-yellow-500/40 rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-yellow-500/40 rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-500/40 rounded-br-sm" />

          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />

          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Certificate of Completion</p>
          <p className="text-gray-400 text-sm mb-1">This is to certify that</p>
          <p className="text-2xl font-bold text-white mb-1">Rahul Sharma</p>
          <p className="text-gray-400 text-sm mb-4">has successfully completed the</p>
          <p className="text-lg font-bold text-yellow-400 mb-1">{ENROLLED_COURSE.title}</p>
          <p className="text-xs text-gray-500 mb-6">3-Month Industry Certification Program</p>

          <div className="flex items-center justify-center gap-2 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>

          <div className="flex items-center justify-around text-center">
            <div>
              <div className="w-20 border-t border-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">AutoJobzy CEO</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">AJ-2026-JAVA-001</p>
              <p className="text-[10px] text-gray-600">Certificate ID</p>
            </div>
            <div>
              <div className="w-20 border-t border-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">Program Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress towards certificate */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Your Progress to Certificate</h3>
        <div className="space-y-3">
          {[
            { label: 'Exam 1 — Core Java',          done: true,  date: 'Passed Mar 15, 2026 · 78/100' },
            { label: 'Exam 2 — Spring Boot',         done: false, date: 'Scheduled Apr 15, 2026' },
            { label: 'Exam 3 — Final (Full Stack)', done: false, date: 'Scheduled May 15, 2026' },
          ].map(({ label, done, date }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10'
              }`}>
                {done
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <span className="text-gray-600 text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? 'text-white' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-[10px] mt-0.5 ${done ? 'text-emerald-400' : 'text-gray-600'}`}>{date}</p>
              </div>
              {done && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  ✓ Done
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Overall completion</p>
            <p className="text-xs font-bold text-white">{Math.round((examsPassedCount / totalExams) * 100)}%</p>
          </div>
          <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${(examsPassedCount / totalExams) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPanel;
