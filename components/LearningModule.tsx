import React, { useState } from 'react';
import {
  BookOpen, LayoutDashboard, Compass, BookMarked,
  CheckSquare, ClipboardList, Award, Mic,
} from 'lucide-react';
import LearningDashboard from './learning/LearningDashboard';
import CourseExplore from './learning/CourseExplore';
import MyCourses from './learning/MyCourses';
import TasksPanel from './learning/TasksPanel';
import ExamsPanel from './learning/ExamsPanel';
import CertificatesPanel from './learning/CertificatesPanel';
import WeeklyInterview from './learning/WeeklyInterview';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubTab =
  | 'dashboard'
  | 'explore'
  | 'my-courses'
  | 'tasks'
  | 'exams'
  | 'certificates'
  | 'weekly-interview';

// ─── Mock enrolled course data (shared across sub-tabs) ───────────────────────

export const ENROLLED_COURSE = {
  id: 1,
  title: 'Full Stack Java + Spring Boot',
  progress: 35,
  currentModule: 'Module 2: Spring Boot Essentials',
  enrolledDate: 'Feb 1, 2026',
  endDate: 'May 1, 2026',
};

// ─── Sub-tab config ───────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string; Icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard',        label: 'Dashboard',        Icon: LayoutDashboard },
  { id: 'explore',          label: 'Explore',          Icon: Compass },
  { id: 'my-courses',       label: 'My Courses',       Icon: BookMarked },
  { id: 'tasks',            label: 'Tasks',            Icon: CheckSquare,  badge: '2' },
  { id: 'exams',            label: 'Exams',            Icon: ClipboardList },
  { id: 'certificates',     label: 'Certificates',     Icon: Award },
  { id: 'weekly-interview', label: 'Weekly Interview', Icon: Mic,          badge: 'DUE' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const LearningModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const [isEnrolled, setIsEnrolled]     = useState(true); // mock: already enrolled

  const handleEnroll = () => {
    setIsEnrolled(true);
    setActiveSubTab('my-courses');
  };

  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'dashboard':
        return <LearningDashboard setActiveSubTab={setActiveSubTab} />;
      case 'explore':
        return <CourseExplore isEnrolled={isEnrolled} onEnroll={handleEnroll} />;
      case 'my-courses':
        return <MyCourses />;
      case 'tasks':
        return <TasksPanel />;
      case 'exams':
        return <ExamsPanel />;
      case 'certificates':
        return <CertificatesPanel />;
      case 'weekly-interview':
        return <WeeklyInterview />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Learning Center</h2>
          <p className="text-xs text-gray-400">Industry-level courses · Live projects · Certification</p>
        </div>
        {isEnrolled && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">Enrolled · Java Course</span>
          </div>
        )}
      </div>

      {/* ── Sub-tab navigation ── */}
      <div
        className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {SUB_TABS.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeSubTab === id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                badge === 'DUE' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Sub-tab content ── */}
      {renderSubTab()}
    </div>
  );
};

export default LearningModule;
