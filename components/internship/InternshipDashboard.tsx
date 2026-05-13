import React from 'react';
import {
  CheckSquare, Calendar, Clock, TrendingUp, Award, Zap,
  Briefcase, MessageCircle, AlertCircle, ChevronRight,
  Star, Users, Video,
} from 'lucide-react';
import { SubTab } from '../InternshipModule';

interface Props {
  setActiveTab: (tab: SubTab) => void;
}

const InternshipDashboard: React.FC<Props> = ({ setActiveTab }) => {
  return (
    <div className="space-y-6">

      {/* Standup alert */}
      <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
        <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <p className="text-sm text-orange-300 flex-1">
          <span className="font-semibold">Daily standup</span> is at 10:00 AM today. Join via Google Meet.
        </p>
        <button className="text-xs text-orange-400 hover:text-orange-300 font-semibold whitespace-nowrap flex items-center gap-1">
          Join Now <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: CheckSquare, label: 'Tasks Done',     val: '4 / 8',     sub: '4 remaining',     color: 'blue' },
          { icon: Calendar,    label: 'Days Remaining', val: '62',         sub: 'Ends Apr 28',     color: 'violet' },
          { icon: Star,        label: 'Mentor Rating',  val: '4.5 / 5',   sub: 'Last week',       color: 'yellow' },
          { icon: Clock,       label: 'Hours Logged',   val: '134 hrs',   sub: 'This month',      color: 'emerald' },
          { icon: TrendingUp,  label: 'Performance',    val: '84%',        sub: 'Above average',   color: 'emerald' },
          { icon: Award,       label: 'Certificate',    val: '40%',        sub: '4 tasks left',    color: 'orange' },
        ].map(({ icon: Icon, label, val, sub, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
              color === 'blue'    ? 'bg-neon-blue/10'   :
              color === 'violet'  ? 'bg-violet-500/10'  :
              color === 'yellow'  ? 'bg-yellow-500/10'  :
              color === 'emerald' ? 'bg-emerald-500/10' :
                                    'bg-orange-500/10'
            }`}>
              <Icon className={`w-5 h-5 ${
                color === 'blue'    ? 'text-neon-blue'   :
                color === 'violet'  ? 'text-violet-400'  :
                color === 'yellow'  ? 'text-yellow-400'  :
                color === 'emerald' ? 'text-emerald-400' :
                                      'text-orange-400'
              }`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* This week */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" /> This Week
          </h3>
          <div className="space-y-3">
            {[
              { day: 'Mon', event: 'Daily Standup',              time: '10:00 AM', type: 'meet' },
              { day: 'Tue', event: 'Task 5 Deadline',            time: '11:59 PM', type: 'task' },
              { day: 'Wed', event: 'Code Review with Mentor',    time: '3:00 PM',  type: 'review' },
              { day: 'Fri', event: 'Weekly Performance Review',  time: '5:00 PM',  type: 'review' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-900 flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                  {ev.day}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ev.event}</p>
                  <p className="text-xs text-gray-500">{ev.time}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ev.type === 'meet'   ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  ev.type === 'task'   ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                         'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                }`}>{ev.type}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold rounded-xl hover:bg-violet-500/20 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> View All Tasks
          </button>
        </div>

        {/* Mentor & Team */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" /> Mentor & Team
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Priya Sharma',  role: 'Lead Mentor',   rating: 4.8, online: true },
              { name: 'Rohit Jain',    role: 'Tech Lead',     rating: null, online: false },
              { name: 'Ananya Mehta',  role: 'Fellow Intern', rating: null, online: true },
              { name: 'Kiran Patil',   role: 'Fellow Intern', rating: null, online: true },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-800 ${member.online ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                {member.rating && (
                  <span className="text-xs text-yellow-400 font-semibold">★ {member.rating}</span>
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold rounded-xl hover:bg-violet-500/20 transition-colors">
            <MessageCircle className="w-4 h-4" /> Message Mentor
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-violet-400" /> Internship Progress
          </h3>
          <span className="text-sm font-bold text-violet-400">40%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden mb-4">
          <div className="h-full w-[40%] bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-700" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Onboarding',          pct: 100, done: true },
            { label: 'Backend APIs',         pct: 100, done: true },
            { label: 'Frontend Integration', pct: 55,  done: false },
            { label: 'Microservices',        pct: 0,   done: false },
          ].map(({ label, pct, done }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-500 truncate">{label}</span>
                <span className="text-[10px] font-bold text-gray-900 dark:text-white">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { text: 'Task 4 reviewed — Mentor rated 4.2/5 with feedback',           time: '2 hours ago', type: 'success' },
            { text: 'You submitted Task 4: React Frontend + API Integration',         time: '1 day ago',   type: 'info' },
            { text: 'Task 5 assigned: Order Management Microservice',                time: '2 days ago',  type: 'info' },
            { text: 'Weekly review completed — Performance score: 84%',             time: '4 days ago',  type: 'success' },
            { text: 'Missed daily standup on Feb 19',                               time: '3 days ago',  type: 'warn' },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                a.type === 'success' ? 'bg-emerald-400' :
                a.type === 'warn'    ? 'bg-orange-400' :
                                       'bg-neon-blue'
              }`} />
              <div className="flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-300">{a.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternshipDashboard;
