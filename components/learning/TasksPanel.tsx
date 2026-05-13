import React, { useState } from 'react';
import {
  CheckCircle, Clock, Lock, Send, ExternalLink,
  Target, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  module: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  dueDate?: string;
  submittedDate?: string;
  reviewNote?: string;
  score?: number;
}

const TASKS: Task[] = [
  {
    id: 1,
    module: 'Module 1',
    title: 'Build a Library Management CLI App',
    description:
      'Create a fully functional Library Management System using Core Java. Implement CRUD operations for books and members. Use Collections, Streams, and proper OOP design patterns. Submit a working GitHub repository.',
    status: 'completed',
    submittedDate: 'Mar 5, 2026',
    reviewNote: 'Excellent implementation! Clean code structure and good use of design patterns. Stream API usage was particularly impressive.',
    score: 92,
  },
  {
    id: 2,
    module: 'Module 2',
    title: 'Implement JWT Authentication System',
    description:
      'Build a complete JWT-based authentication system using Spring Boot & Spring Security. Include user registration, login, token refresh, and role-based authorization. Deploy to a public URL (Railway/Render/AWS). Submit GitHub link + live URL.',
    status: 'in-progress',
    dueDate: 'Mar 20, 2026',
  },
  {
    id: 3,
    module: 'Module 2 (Completion)',
    title: 'Spring Boot Microservices with API Gateway',
    description:
      'Design and build 3 interconnected microservices with Eureka Service Discovery and Spring Cloud Gateway. Implement inter-service communication and centralized config.',
    status: 'locked',
  },
  {
    id: 4,
    module: 'Module 3',
    title: 'Design a Microservices E-commerce System',
    description:
      'Build a production-grade e-commerce backend with Order, Product, Payment & User microservices. Use Kafka for event streaming, Redis for caching, and Docker for deployment.',
    status: 'locked',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const TasksPanel: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(2); // Task 2 open
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = () => {
    if (!githubUrl.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="space-y-4">

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed', val: '1', color: 'emerald' },
          { label: 'In Progress', val: '1', color: 'yellow' },
          { label: 'Locked', val: '2', color: 'gray' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${
              color === 'emerald' ? 'text-emerald-400' :
              color === 'yellow'  ? 'text-yellow-400'  :
                                    'text-gray-600'
            }`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {TASKS.map((task) => {
          const isOpen = expanded === task.id;

          return (
            <div
              key={task.id}
              className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all ${
                task.status === 'completed'   ? 'border-emerald-500/30' :
                task.status === 'in-progress' ? 'border-yellow-500/30' :
                                               'border-white/10 opacity-60'
              }`}
            >
              {/* Task header */}
              <button
                onClick={() => setExpanded(isOpen ? null : task.id)}
                disabled={task.status === 'locked'}
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors disabled:cursor-not-allowed"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  task.status === 'completed'   ? 'bg-emerald-500/20 border border-emerald-500/40' :
                  task.status === 'in-progress' ? 'bg-yellow-500/20 border border-yellow-500/40' :
                                                 'bg-white/5 border border-white/10'
                }`}>
                  {task.status === 'completed'   ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                   task.status === 'in-progress' ? <Target className="w-4 h-4 text-yellow-400" /> :
                                                   <Lock className="w-4 h-4 text-gray-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                        task.status === 'locked' ? 'text-gray-600' : 'text-gray-500'
                      }`}>{task.module}</p>
                      <p className={`text-sm font-semibold ${
                        task.status === 'locked' ? 'text-gray-600' : 'text-white'
                      }`}>{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.status === 'completed'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                       'bg-white/5 text-gray-600 border border-white/10'
                      }`}>
                        {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Locked'}
                      </span>
                      {task.status !== 'locked' && (
                        isOpen
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {task.dueDate}
                    </p>
                  )}
                  {task.submittedDate && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Submitted: {task.submittedDate}
                    </p>
                  )}
                </div>
              </button>

              {/* Task detail */}
              {isOpen && (
                <div className="border-t border-white/10 px-5 py-4 space-y-4">
                  {/* Description */}
                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2">Task Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
                  </div>

                  {/* Completed: review */}
                  {task.status === 'completed' && task.reviewNote && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <p className="text-xs font-semibold text-emerald-400">Mentor Review</p>
                        {task.score && (
                          <span className="ml-auto text-sm font-bold text-emerald-400">{task.score}/100</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{task.reviewNote}</p>
                    </div>
                  )}

                  {/* In-progress: submit form */}
                  {task.status === 'in-progress' && (
                    submitted ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-semibold">
                        <CheckCircle className="w-5 h-5" /> Task submitted for review!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Submit Your Work</p>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">GitHub Repository URL <span className="text-red-400">*</span></label>
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/yourusername/project"
                            className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-white text-sm focus:border-neon-blue focus:outline-none placeholder-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">Live URL (optional)</label>
                          <input
                            type="url"
                            value={liveUrl}
                            onChange={e => setLiveUrl(e.target.value)}
                            placeholder="https://your-project.railway.app"
                            className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-white text-sm focus:border-neon-blue focus:outline-none placeholder-gray-600"
                          />
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-300">
                            Ensure your repo is public and has a clear README. Mentor will review within 48 hours.
                          </p>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={!githubUrl.trim() || submitting}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-yellow-500/20"
                        >
                          {submitting ? 'Submitting…' : <><Send className="w-4 h-4" /> Submit Task</>}
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPanel;
