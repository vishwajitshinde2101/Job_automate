import React from 'react';
import {
  Trophy, Calendar, MapPin, Clock, CheckCircle,
  Lock, TrendingUp, AlertCircle, FileText,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Exam {
  id: number;
  number: number;
  label: string;
  date: string;
  time: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'locked';
  score?: number;
  passed?: boolean;
  month: string;
  topics: string[];
}

const EXAMS: Exam[] = [
  {
    id: 1,
    number: 1,
    label: 'Exam 1 — Month 1',
    date: 'Mar 15, 2026',
    time: '10:00 AM – 12:00 PM',
    venue: 'AutoJobzy Testing Center, Pune',
    status: 'completed',
    score: 78,
    passed: true,
    month: 'March 2026',
    topics: ['Core Java', 'OOP', 'Collections', 'Streams', 'Multithreading', 'Design Patterns'],
  },
  {
    id: 2,
    number: 2,
    label: 'Exam 2 — Month 2',
    date: 'Apr 15, 2026',
    time: '10:00 AM – 12:00 PM',
    venue: 'AutoJobzy Testing Center, Pune',
    status: 'upcoming',
    month: 'April 2026',
    topics: ['Spring Boot', 'REST APIs', 'Spring Security', 'JPA/Hibernate', 'Microservices Basics'],
  },
  {
    id: 3,
    number: 3,
    label: 'Exam 3 — Final (Month 3)',
    date: 'May 15, 2026',
    time: '10:00 AM – 12:00 PM',
    venue: 'AutoJobzy Testing Center, Pune',
    status: 'locked',
    month: 'May 2026',
    topics: ['Advanced Microservices', 'Kafka', 'Docker/K8s', 'Redis', 'CI/CD', 'Capstone Project'],
  },
];

// ─── Countdown (days to exam) ─────────────────────────────────────────────────

const daysUntil = (dateStr: string): number => {
  const target = new Date(dateStr);
  const today  = new Date();
  const diff   = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

// ─── Component ───────────────────────────────────────────────────────────────

const ExamsPanel: React.FC = () => {
  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Passed',   val: '1 / 3', color: 'emerald' },
          { label: 'Upcoming', val: '1',      color: 'neon-blue' },
          { label: 'Locked',   val: '1',      color: 'gray' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-center">
            <p className={`text-xl font-bold ${
              color === 'emerald'  ? 'text-emerald-400' :
              color === 'neon-blue' ? 'text-neon-blue' :
                                     'text-gray-600'
            }`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Rules banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
        <AlertCircle className="w-4 h-4 text-neon-blue flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-gray-400">
          <p><span className="text-white font-semibold">Exam Rules:</span> Appear at the listed venue with valid ID.</p>
          <p>Pass (≥ 60%) → Next exam unlocks · Fail → 1 month extension (once only)</p>
          <p>Pass all 3 → Certificate issued within 7 business days</p>
          <p className="text-red-400 font-medium">Weekly mock interviews are mandatory — missed interviews flagged to evaluators.</p>
        </div>
      </div>

      {/* Exam cards */}
      <div className="space-y-4">
        {EXAMS.map((exam) => {
          const days = exam.status === 'upcoming' ? daysUntil(exam.date) : null;

          return (
            <div
              key={exam.id}
              className={`bg-dark-800 border rounded-2xl overflow-hidden ${
                exam.status === 'completed' && exam.passed ? 'border-emerald-500/30' :
                exam.status === 'upcoming'                 ? 'border-neon-blue/30'  :
                                                            'border-white/10 opacity-60'
              }`}
            >
              {/* Card header */}
              <div className={`px-5 py-4 flex items-center justify-between ${
                exam.status === 'completed' && exam.passed ? 'bg-emerald-500/5' :
                exam.status === 'upcoming'                 ? 'bg-neon-blue/5'   :
                                                            ''
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base ${
                    exam.status === 'completed' && exam.passed ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
                    exam.status === 'upcoming'                 ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' :
                                                                'bg-white/5 border border-white/10 text-gray-600'
                  }`}>
                    {exam.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                     exam.status === 'locked'    ? <Lock className="w-5 h-5" /> :
                                                   exam.number}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${exam.status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                      {exam.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{exam.month}</p>
                  </div>
                </div>

                <div className="text-right">
                  {exam.status === 'completed' && exam.score !== undefined && (
                    <>
                      <p className={`text-2xl font-bold ${exam.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {exam.score}<span className="text-gray-500 text-sm">/100</span>
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exam.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {exam.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </>
                  )}
                  {exam.status === 'upcoming' && days !== null && (
                    <>
                      <p className="text-2xl font-bold text-neon-blue">{days}</p>
                      <p className="text-[10px] text-gray-500">days away</p>
                    </>
                  )}
                  {exam.status === 'locked' && (
                    <Lock className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Details */}
              {exam.status !== 'locked' && (
                <div className="px-5 py-4 border-t border-white/10 space-y-4">
                  {/* Date / time / venue */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Calendar, label: 'Date',  val: exam.date },
                      { icon: Clock,    label: 'Time',  val: exam.time },
                      { icon: MapPin,   label: 'Venue', val: exam.venue },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-wide">{label}</p>
                          <p className="text-xs text-gray-300">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Topics */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Topics Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.topics.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hall ticket / score breakdown */}
                  {exam.status === 'upcoming' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-semibold rounded-xl hover:bg-neon-blue/15 transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Download Hall Ticket
                    </button>
                  )}
                  {exam.status === 'completed' && (
                    <div className="bg-dark-900 border border-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2">Score Breakdown</p>
                      <div className="space-y-2">
                        {[
                          { section: 'Theory (MCQ)',      score: 38, max: 50 },
                          { section: 'Coding Problem',    score: 25, max: 30 },
                          { section: 'Practical Viva',    score: 15, max: 20 },
                        ].map(({ section, score, max }) => (
                          <div key={section}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">{section}</span>
                              <span className="text-xs font-semibold text-white">{score}/{max}</span>
                            </div>
                            <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(score / max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Study tips */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-purple" /> Exam Preparation Tips
        </h3>
        <ul className="space-y-2">
          {[
            'Complete all lessons in the module before the exam',
            'Attempt every weekly mock interview — they mirror the exam pattern',
            'Submit and get your tasks reviewed — reviewers assess practical knowledge',
            'Focus on the Coding Problem section (30 marks) — practise on LeetCode',
            'Revise module-specific topics using the course materials provided',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="w-4 h-4 rounded-full bg-neon-purple/20 text-neon-purple text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExamsPanel;
