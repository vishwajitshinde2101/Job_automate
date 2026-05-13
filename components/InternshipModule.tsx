import React, { useState } from 'react';
import {
  Briefcase, LayoutDashboard, Search, Building2,
  CheckSquare, TrendingUp, Award,
} from 'lucide-react';
import InternshipDashboard from './internship/InternshipDashboard';
import BrowseInternships from './internship/BrowseInternships';
import MyInternship from './internship/MyInternship';
import InternshipTasks from './internship/InternshipTasks';
import InternshipProgress from './internship/InternshipProgress';
import InternshipCertificate from './internship/InternshipCertificate';

type SubTab = 'dashboard' | 'browse' | 'my-internship' | 'tasks' | 'progress' | 'certificate';

export { SubTab };

const tabs: { id: SubTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'browse',        label: 'Browse',          icon: Search },
  { id: 'my-internship', label: 'My Internship',   icon: Building2 },
  { id: 'tasks',         label: 'Tasks',           icon: CheckSquare, badge: '3' },
  { id: 'progress',      label: 'Progress',        icon: TrendingUp },
  { id: 'certificate',   label: 'Certificate',     icon: Award },
];

const InternshipModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':     return <InternshipDashboard setActiveTab={setActiveTab} />;
      case 'browse':        return <BrowseInternships />;
      case 'my-internship': return <MyInternship />;
      case 'tasks':         return <InternshipTasks />;
      case 'progress':      return <InternshipProgress />;
      case 'certificate':   return <InternshipCertificate />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800">

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="intern-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#intern-grid)" />
          </svg>
          {/* Diagonal stripe accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />
        </div>

        {/* Header content */}
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shadow-lg">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-white">Online Internship</h1>
                <span className="px-2 py-0.5 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold rounded-full animate-pulse">
                  ACTIVE
                </span>
              </div>
              <p className="text-indigo-200 text-sm">Full Stack Java Intern · AutoJobzy Technologies</p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Stipend',  val: '₹18,000/mo' },
              { label: 'Duration', val: '3 Months' },
              { label: 'Days Left',val: '62 Days' },
              { label: 'Mode',     val: 'Remote' },
            ].map(s => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3"
              >
                <p className="text-white font-bold text-lg leading-tight">{s.val}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sub-tab navigation ───────────────────────────── */}
        <div className="relative border-t border-white/15 mt-2">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all relative border-b-2 ${
                      isActive
                        ? 'text-white border-white'
                        : 'text-indigo-200 border-transparent hover:text-white hover:border-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge && (
                      <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default InternshipModule;
