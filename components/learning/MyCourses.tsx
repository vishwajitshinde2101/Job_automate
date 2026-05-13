import React, { useState } from 'react';
import {
  CheckCircle, Lock, Play, ChevronDown, ChevronUp,
  BookOpen, Clock, Target,
} from 'lucide-react';
import { ENROLLED_COURSE } from '../LearningModule';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Lesson {
  id: number;
  title: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'locked';
}

interface Module {
  id: number;
  title: string;
  status: 'completed' | 'in-progress' | 'locked';
  lessons: Lesson[];
  taskTitle: string;
  taskStatus: 'completed' | 'in-progress' | 'locked';
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'Module 1: Core Java Fundamentals',
    status: 'completed',
    taskTitle: 'Build a Library Management CLI App',
    taskStatus: 'completed',
    lessons: [
      { id: 1, title: 'OOP Concepts — Classes, Inheritance, Polymorphism', duration: '45 min', status: 'completed' },
      { id: 2, title: 'Collections Framework — List, Map, Set', duration: '50 min', status: 'completed' },
      { id: 3, title: 'Exception Handling & Custom Exceptions', duration: '35 min', status: 'completed' },
      { id: 4, title: 'Streams, Lambdas & Functional Interfaces', duration: '60 min', status: 'completed' },
      { id: 5, title: 'Multithreading & Concurrency', duration: '55 min', status: 'completed' },
      { id: 6, title: 'Design Patterns — Singleton, Factory, Builder', duration: '40 min', status: 'completed' },
    ],
  },
  {
    id: 2,
    title: 'Module 2: Spring Boot Essentials',
    status: 'in-progress',
    taskTitle: 'Implement JWT Authentication System',
    taskStatus: 'in-progress',
    lessons: [
      { id: 7,  title: 'Spring IoC & Dependency Injection',       duration: '40 min', status: 'completed' },
      { id: 8,  title: 'Building REST APIs with Spring Boot',      duration: '60 min', status: 'completed' },
      { id: 9,  title: 'Spring Data JPA & Database Integration',   duration: '55 min', status: 'completed' },
      { id: 10, title: 'Spring Security — JWT & OAuth2',           duration: '70 min', status: 'in-progress' },
      { id: 11, title: 'Microservices Basics — Eureka & Gateway',  duration: '65 min', status: 'locked' },
      { id: 12, title: 'Testing — JUnit 5 & Mockito',             duration: '45 min', status: 'locked' },
    ],
  },
  {
    id: 3,
    title: 'Module 3: Advanced Architecture',
    status: 'locked',
    taskTitle: 'Design a Microservices E-commerce System',
    taskStatus: 'locked',
    lessons: [
      { id: 13, title: 'Advanced Microservices — Event-Driven Design', duration: '75 min', status: 'locked' },
      { id: 14, title: 'Message Queues — RabbitMQ & Kafka',            duration: '60 min', status: 'locked' },
      { id: 15, title: 'Docker & Kubernetes Deployment',               duration: '80 min', status: 'locked' },
      { id: 16, title: 'Caching with Redis',                           duration: '45 min', status: 'locked' },
      { id: 17, title: 'Monitoring — Prometheus & Grafana',            duration: '50 min', status: 'locked' },
      { id: 18, title: 'CI/CD Pipeline with GitHub Actions',           duration: '55 min', status: 'locked' },
    ],
  },
  {
    id: 4,
    title: 'Module 4: Capstone Project',
    status: 'locked',
    taskTitle: 'Build a Full-Scale Banking Application',
    taskStatus: 'locked',
    lessons: [
      { id: 19, title: 'Project Planning & Architecture Design',  duration: '60 min', status: 'locked' },
      { id: 20, title: 'Backend Development — Sprint 1',          duration: '90 min', status: 'locked' },
      { id: 21, title: 'Backend Development — Sprint 2',          duration: '90 min', status: 'locked' },
      { id: 22, title: 'Frontend Integration',                    duration: '75 min', status: 'locked' },
      { id: 23, title: 'Testing & QA',                            duration: '60 min', status: 'locked' },
      { id: 24, title: 'Deployment & Presentation',               duration: '45 min', status: 'locked' },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const MyCourses: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<number>(2); // Module 2 open by default

  const completedLessons = MODULES.flatMap(m => m.lessons).filter(l => l.status === 'completed').length;
  const totalLessons     = MODULES.flatMap(m => m.lessons).length;

  return (
    <div className="space-y-5">

      {/* Course header */}
      <div className="bg-dark-800 border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{ENROLLED_COURSE.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enrolled {ENROLLED_COURSE.enrolledDate} · Ends {ENROLLED_COURSE.endDate}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-emerald-400">{ENROLLED_COURSE.progress}%</p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          {[
            { icon: BookOpen, label: 'Lessons Done',  val: `${completedLessons}/${totalLessons}` },
            { icon: Target,   label: 'Current Module', val: 'Module 2' },
            { icon: Clock,    label: 'Time Left',      val: '67 days' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="text-center">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-1.5">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-white">{val}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${ENROLLED_COURSE.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules accordion */}
      <div className="space-y-3">
        {MODULES.map((mod) => {
          const isOpen = expandedModule === mod.id;
          const doneCount = mod.lessons.filter(l => l.status === 'completed').length;

          return (
            <div
              key={mod.id}
              className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all ${
                mod.status === 'completed'   ? 'border-emerald-500/30' :
                mod.status === 'in-progress' ? 'border-neon-blue/30' :
                                              'border-white/10 opacity-60'
              }`}
            >
              {/* Module header */}
              <button
                onClick={() => setExpandedModule(isOpen ? 0 : mod.id)}
                disabled={mod.status === 'locked'}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors disabled:cursor-not-allowed"
              >
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  mod.status === 'completed'   ? 'bg-emerald-500/20 border border-emerald-500/40' :
                  mod.status === 'in-progress' ? 'bg-neon-blue/20 border border-neon-blue/40' :
                                                'bg-white/5 border border-white/10'
                }`}>
                  {mod.status === 'completed'   ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                   mod.status === 'in-progress' ? <Play className="w-4 h-4 text-neon-blue" /> :
                                                  <Lock className="w-4 h-4 text-gray-600" />}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    mod.status === 'locked' ? 'text-gray-600' : 'text-white'
                  }`}>{mod.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {doneCount}/{mod.lessons.length} lessons · Task: {mod.taskTitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    mod.status === 'completed'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    mod.status === 'in-progress' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' :
                                                  'bg-white/5 text-gray-600 border border-white/10'
                  }`}>
                    {mod.status === 'completed' ? 'Completed' : mod.status === 'in-progress' ? 'In Progress' : 'Locked'}
                  </span>
                  {mod.status !== 'locked' && (
                    isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                  {mod.status === 'locked' && <Lock className="w-4 h-4 text-gray-600" />}
                </div>
              </button>

              {/* Lessons list */}
              {isOpen && (
                <div className="border-t border-white/10 px-5 py-3 space-y-1">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        lesson.status === 'locked'
                          ? 'opacity-40 cursor-not-allowed'
                          : lesson.status === 'in-progress'
                          ? 'bg-neon-blue/5 border border-neon-blue/15 cursor-pointer hover:bg-neon-blue/10'
                          : 'hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      {lesson.status === 'completed'   ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> :
                       lesson.status === 'in-progress' ? <Play className="w-4 h-4 text-neon-blue flex-shrink-0" /> :
                                                         <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                      <span className={`text-xs flex-1 ${
                        lesson.status === 'in-progress' ? 'text-white font-medium' :
                        lesson.status === 'locked'      ? 'text-gray-600' :
                                                          'text-gray-300'
                      }`}>{lesson.title}</span>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">{lesson.duration}</span>
                      {lesson.status === 'in-progress' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-neon-blue/20 text-neon-blue rounded-full flex-shrink-0">
                          Continue
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Module task */}
                  <div className={`flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl border ${
                    mod.taskStatus === 'completed'   ? 'bg-emerald-500/5 border-emerald-500/20' :
                    mod.taskStatus === 'in-progress' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                                      'bg-white/5 border-white/10 opacity-40'
                  }`}>
                    <Target className={`w-4 h-4 flex-shrink-0 ${
                      mod.taskStatus === 'completed'   ? 'text-emerald-400' :
                      mod.taskStatus === 'in-progress' ? 'text-yellow-400' :
                                                        'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Project Task</p>
                      <p className="text-xs text-gray-300">{mod.taskTitle}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      mod.taskStatus === 'completed'   ? 'bg-emerald-500/10 text-emerald-400' :
                      mod.taskStatus === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-white/5 text-gray-600'
                    }`}>
                      {mod.taskStatus === 'completed' ? 'Done' : mod.taskStatus === 'in-progress' ? 'Pending' : 'Locked'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
