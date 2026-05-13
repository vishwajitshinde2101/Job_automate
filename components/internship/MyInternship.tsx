import React from 'react';
import {
  MapPin, Calendar, Clock, Link2,
  Github, Monitor, Coffee, CheckCircle,
  Briefcase, Star, Phone, Mail,
} from 'lucide-react';

const milestones = [
  { label: 'Onboarding & Setup',           date: 'Jan 28, 2026', done: true,  note: 'Environment setup, team intro, Git repo access' },
  { label: 'Module 1 — Backend APIs',       date: 'Feb 14, 2026', done: true,  note: 'Built REST APIs for auth, user profiles, products' },
  { label: 'Module 2 — Frontend Integration', date: 'Mar 7, 2026',  done: false, note: 'Current: Connecting React UI to Spring Boot APIs' },
  { label: 'Module 3 — Microservices',      date: 'Mar 28, 2026', done: false, note: 'Docker, Kafka, Eureka, API Gateway' },
  { label: 'Final Capstone Project',        date: 'Apr 10, 2026', done: false, note: 'Full-stack e-commerce platform demo' },
  { label: 'Certificate Issuance',          date: 'Apr 28, 2026', done: false, note: 'After mentor evaluation and final review' },
];

const MyInternship: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Company card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent border border-violet-500/20 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
            AJ
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Full Stack Java Intern</h2>
            <p className="text-violet-600 dark:text-violet-300 text-sm font-medium">AutoJobzy Technologies Pvt. Ltd.</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Remote (Pune HQ)</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Jan 28 – Apr 28, 2026</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 40 hrs / week</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹18,000</p>
            <p className="text-xs text-gray-400">per month</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Mentor card */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Your Mentor</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              P
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Priya Sharma</p>
              <p className="text-sm text-gray-500">Senior Software Engineer</p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-3 h-3 ${i <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-400 ml-1">4.8</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="w-3.5 h-3.5 text-violet-400" />
              <span>priya@autojobzy.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-violet-400" />
              <span>Available: Mon–Fri, 9AM–6PM IST</span>
            </div>
          </div>
          <button className="w-full py-2 border border-violet-500/30 text-violet-400 text-xs font-semibold rounded-xl hover:bg-violet-500/10 transition-colors">
            Schedule 1:1 Meeting
          </button>
        </div>

        {/* Daily schedule */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Daily Schedule</h3>
          <div className="space-y-4">
            {[
              { time: '10:00 AM', event: 'Daily Standup',               days: 'Mon – Fri',   type: 'meet',   link: true },
              { time: '3:00 PM',  event: 'Code Review with Mentor',      days: 'Wednesday',   type: 'review', link: true },
              { time: '5:00 PM',  event: 'Weekly Performance Review',    days: 'Friday',      type: 'review', link: true },
              { time: '11:59 PM', event: 'Task Submission Deadline',     days: 'As assigned', type: 'task',   link: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{s.time}</p>
                  <p className="text-[10px] text-gray-500">{s.days}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{s.event}</p>
                </div>
                {s.link && (
                  <button className="text-violet-400 hover:text-violet-300 transition-colors">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Important Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Github,   label: 'GitHub Repo',    sub: 'autojobzy/intern-2026', color: 'gray' },
            { icon: Monitor,  label: 'Google Meet',    sub: 'Daily standup link',    color: 'blue' },
            { icon: Briefcase,label: 'Notion Board',   sub: 'Tasks & project docs',  color: 'violet' },
            { icon: Coffee,   label: 'Slack Channel',  sub: '#intern-batch-2026',    color: 'orange' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <button
              key={label}
              className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-dark-900 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-violet-500/20 group"
            >
              <Icon className={`w-6 h-6 mb-2 transition-colors ${
                color === 'gray'   ? 'text-gray-400 group-hover:text-gray-300' :
                color === 'blue'   ? 'text-blue-400 group-hover:text-blue-300' :
                color === 'violet' ? 'text-violet-400 group-hover:text-violet-300' :
                                     'text-orange-400 group-hover:text-orange-300'
              }`} />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap / milestones */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-6">Internship Roadmap</h3>
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200 dark:bg-white/10" />
          <div className="space-y-6 pl-10">
            {milestones.map((m, i) => {
              const isCurrent = !m.done && milestones.slice(0, i).every(x => x.done);
              return (
                <div key={i} className="relative">
                  <div className={`absolute -left-[26px] w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    m.done    ? 'bg-emerald-500 border-emerald-500' :
                    isCurrent ? 'bg-violet-600 border-violet-600 animate-pulse' :
                                'bg-white dark:bg-dark-800 border-gray-200 dark:border-white/20'
                  }`}>
                    {m.done ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-[10px] font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${m.done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {m.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.date} · {m.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInternship;
