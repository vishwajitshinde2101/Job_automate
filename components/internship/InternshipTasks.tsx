import React, { useState } from 'react';
import {
  CheckCircle, Clock, Lock, AlertCircle, Github,
  ExternalLink, ChevronDown, ChevronUp, Send, MessageSquare,
} from 'lucide-react';

interface Task {
  id: number;
  week: number;
  title: string;
  description: string;
  skills: string[];
  deadline: string;
  status: 'completed' | 'in-progress' | 'locked';
  score?: number;
  feedback?: string;
  submittedUrl?: string;
}

const TASKS: Task[] = [
  {
    id: 1, week: 1,
    title: 'Setup & Hello World Spring Boot App',
    description: 'Set up the development environment and create a basic Spring Boot REST API with a health-check endpoint, Swagger docs, and Git repository.',
    skills: ['Java', 'Spring Boot', 'Maven', 'Git'],
    deadline: 'Feb 4, 2026',
    status: 'completed', score: 92,
    feedback: 'Excellent setup! Clean code structure and well-documented endpoints. Add unit tests next time.',
    submittedUrl: 'https://github.com/user/task1',
  },
  {
    id: 2, week: 2,
    title: 'User Authentication API',
    description: 'Build a complete JWT-based auth system with login, register, refresh token, and role-based access control (RBAC).',
    skills: ['JWT', 'Spring Security', 'PostgreSQL'],
    deadline: 'Feb 14, 2026',
    status: 'completed', score: 85,
    feedback: 'Good JWT implementation. Refresh token rotation could be improved. SQL queries were efficient.',
    submittedUrl: 'https://github.com/user/task2',
  },
  {
    id: 3, week: 3,
    title: 'Product Catalog REST API',
    description: 'Design and implement a product catalog API with full CRUD, search, filtering, and cursor-based pagination.',
    skills: ['JPA/Hibernate', 'Spring Data', 'REST'],
    deadline: 'Feb 21, 2026',
    status: 'completed', score: 88,
    feedback: 'Well-structured API. Pagination implemented correctly. Add Swagger/OpenAPI documentation next time.',
    submittedUrl: 'https://github.com/user/task3',
  },
  {
    id: 4, week: 4,
    title: 'React Frontend + API Integration',
    description: 'Build a React.js frontend that consumes your Spring Boot APIs — login flow, product listing, and full CRUD operations with proper error handling.',
    skills: ['React', 'Axios', 'Tailwind CSS', 'React Query'],
    deadline: 'Feb 28, 2026',
    status: 'completed', score: 78,
    feedback: 'UI looks clean! State management could be improved using React Query. Error handling needs work on network failures.',
    submittedUrl: 'https://github.com/user/task4',
  },
  {
    id: 5, week: 5,
    title: 'Order Management Microservice',
    description: 'Break the monolith. Create a separate Order microservice with async messaging via Kafka and inter-service communication.',
    skills: ['Kafka', 'Microservices', 'Docker', 'Spring Cloud'],
    deadline: 'Mar 7, 2026',
    status: 'in-progress',
  },
  {
    id: 6, week: 6,
    title: 'API Gateway + Service Registry',
    description: 'Set up Spring Cloud Gateway and Eureka service registry for microservices discovery and load balancing.',
    skills: ['Spring Cloud', 'Eureka', 'API Gateway'],
    deadline: 'Mar 14, 2026',
    status: 'locked',
  },
  {
    id: 7, week: 7,
    title: 'CI/CD Pipeline with GitHub Actions',
    description: 'Automate testing and deployment using GitHub Actions workflows. Deploy the application to AWS EC2.',
    skills: ['GitHub Actions', 'AWS EC2', 'Docker', 'Shell'],
    deadline: 'Mar 21, 2026',
    status: 'locked',
  },
  {
    id: 8, week: 8,
    title: 'Final Capstone Project',
    description: 'Build a complete e-commerce platform from scratch using all the skills you have learned. This is your internship final project demo.',
    skills: ['Full Stack', 'Microservices', 'AWS', 'Docker'],
    deadline: 'Apr 10, 2026',
    status: 'locked',
  },
];

const InternshipTasks: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(5);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const completed = TASKS.filter(t => t.status === 'completed');
  const avgScore = Math.round(completed.reduce((s, t) => s + (t.score ?? 0), 0) / completed.length);

  const handleSubmit = () => {
    if (!githubUrl.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Completed',   val: `${completed.length}`, color: 'emerald' },
          { label: 'In Progress', val: '1',                   color: 'violet' },
          { label: 'Locked',      val: '3',                   color: 'gray' },
          { label: 'Avg Score',   val: `${avgScore}%`,        color: 'yellow' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 text-center">
            <p className={`text-xl font-bold ${
              color === 'emerald' ? 'text-emerald-400' :
              color === 'violet'  ? 'text-violet-400'  :
              color === 'yellow'  ? 'text-yellow-400'  :
                                    'text-gray-500'
            }`}>{val}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {TASKS.map(task => {
          const isExpanded = expandedId === task.id;
          const canExpand  = task.status !== 'locked';

          return (
            <div
              key={task.id}
              className={`bg-white dark:bg-dark-800 border rounded-2xl overflow-hidden transition-all ${
                task.status === 'in-progress' ? 'border-violet-500/40' :
                task.status === 'completed'   ? 'border-emerald-500/20' :
                                               'border-gray-200 dark:border-white/10 opacity-60'
              }`}
            >
              {/* Row header */}
              <button
                onClick={() => canExpand && setExpandedId(isExpanded ? null : task.id)}
                disabled={!canExpand}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  task.status === 'completed'   ? 'bg-emerald-500/20 border border-emerald-500/30' :
                  task.status === 'in-progress' ? 'bg-violet-500/20 border border-violet-500/30'  :
                                                  'bg-gray-100 dark:bg-dark-900 border border-gray-200 dark:border-white/10'
                }`}>
                  {task.status === 'completed'   ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                   task.status === 'in-progress' ? <Clock       className="w-4 h-4 text-violet-400"  /> :
                                                   <Lock        className="w-4 h-4 text-gray-400"    />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${task.status === 'locked' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      Task {task.week}: {task.title}
                    </p>
                    {task.status === 'in-progress' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Due: {task.deadline}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.score !== undefined && (
                    <p className={`text-sm font-bold ${
                      task.score >= 85 ? 'text-emerald-400' :
                      task.score >= 70 ? 'text-yellow-400' :
                                          'text-red-400'
                    }`}>{task.score}%</p>
                  )}
                  {canExpand && (
                    isExpanded
                      ? <ChevronUp   className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-white/5 space-y-4 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {task.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] rounded-lg">{s}</span>
                    ))}
                  </div>

                  {/* Completed: show feedback */}
                  {task.status === 'completed' && task.feedback && (
                    <div className="space-y-2">
                      {task.submittedUrl && (
                        <a href={task.submittedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-neon-blue hover:underline">
                          <Github className="w-3.5 h-3.5" /> {task.submittedUrl}
                        </a>
                      )}
                      <div className="flex items-start gap-2.5 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-semibold text-emerald-400 mb-1">Mentor Feedback</p>
                          <p className="text-xs text-gray-400 leading-relaxed">{task.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* In-progress: submission form */}
                  {task.status === 'in-progress' && !submitted && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block font-medium">GitHub Repository URL *</label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/your-repo"
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block font-medium">Live URL (optional)</label>
                        <div className="relative">
                          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={liveUrl}
                            onChange={e => setLiveUrl(e.target.value)}
                            placeholder="https://your-app.vercel.app"
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 transition-colors"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={!githubUrl.trim() || submitting}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                          githubUrl.trim() && !submitting
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                            : 'bg-gray-100 dark:bg-dark-900 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {submitting
                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                          : <><Send className="w-4 h-4" /> Submit Task</>
                        }
                      </button>
                    </div>
                  )}

                  {submitted && task.status === 'in-progress' && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">Submitted!</p>
                        <p className="text-xs text-gray-400">Mentor will review within 1-2 business days.</p>
                      </div>
                    </div>
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

export default InternshipTasks;
