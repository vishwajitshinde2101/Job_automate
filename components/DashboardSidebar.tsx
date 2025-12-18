
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  FileText,
  CreditCard,
  LogOut,
  Cpu,
  BarChart3,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Fetch user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        setUserName(fullName || 'User');
        setUserEmail(user.email || '');
      } catch (e) {
        setUserName('User');
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Analytics hidden for regular users
  const showAnalyticsTab = false;

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    ...(showAnalyticsTab ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
    { id: 'config', label: 'Job Profile', icon: Settings },
    { id: 'history', label: 'Application History', icon: FileText },
    { id: 'billing', label: 'My Plan', icon: CreditCard },
  ];

  return (
    <div className="w-64 bg-dark-900 border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex">
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <Cpu className="h-6 w-6 text-neon-blue animate-pulse mr-2" />
        <span className="font-heading font-bold text-xl text-white">
          Job<span className="text-neon-blue">AutoApply</span>
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === item.id
              ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-neon-blue' : 'text-gray-500 group-hover:text-white'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">{userName}</div>
            {userEmail && (
              <div className="text-gray-500 text-xs truncate">{userEmail}</div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;