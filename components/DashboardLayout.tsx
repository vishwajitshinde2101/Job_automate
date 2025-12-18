
import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900 border-b border-white/10 flex items-center px-4 z-50 justify-between">
        <span className="font-heading font-bold text-lg text-white">JobAutoApply</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-dark-800 z-40 border-b border-white/10 p-4 space-y-2">
          <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-white rounded ${activeTab === 'overview' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5'}`}>Dashboard</button>
          {/* Analytics hidden */}
          {false && <button onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-white rounded ${activeTab === 'analytics' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5'}`}>Analytics</button>}
          <button onClick={() => { setActiveTab('config'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-white rounded ${activeTab === 'config' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5'}`}>Job Profile</button>
          <button onClick={() => { setActiveTab('history'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-white rounded ${activeTab === 'history' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5'}`}>History</button>
          <button onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-white rounded ${activeTab === 'billing' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5'}`}>My Plan</button>
        </div>
      )}

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
