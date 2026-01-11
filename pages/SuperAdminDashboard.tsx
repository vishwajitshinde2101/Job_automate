import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  ChevronRight,
  Activity,
  UserPlus,
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

interface DashboardStats {
  totalInstitutes: number;
  activeInstitutes: number;
  totalStudents: number;
  totalAdmins: number;
  totalStaff: number;
  activeSubscriptions: number;
  pendingPayments: number;
  totalRevenue: number;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminSidebar>
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </SuperAdminSidebar>
    );
  }

  if (error) {
    return (
      <SuperAdminSidebar>
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </SuperAdminSidebar>
    );
  }

  return (
    <SuperAdminSidebar>
      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <div className="bg-dark-800 border-b border-white/10">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of your platform</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Institutes */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Institutes</p>
                <p className="text-3xl font-bold text-white">{stats?.totalInstitutes || 0}</p>
                <p className="text-green-400 text-xs mt-2">
                  {stats?.activeInstitutes || 0} active
                </p>
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
                <p className="text-gray-500 text-xs mt-2">Across all institutes</p>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-white">{stats?.activeSubscriptions || 0}</p>
                <p className="text-orange-400 text-xs mt-2">
                  {stats?.pendingPayments || 0} pending payments
                </p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-gray-500 text-xs mt-2">From subscriptions</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Navigation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Management Cards */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/superadmin/institutes')}
                    className="group p-4 bg-dark-900 border border-white/5 rounded-lg hover:border-neon-blue/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Building2 className="w-6 h-6 text-neon-blue" />
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-blue transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Institute Management</h3>
                    <p className="text-gray-400 text-sm">Manage all institutes</p>
                  </button>

                  <button
                    onClick={() => navigate('/superadmin/packages')}
                    className="group p-4 bg-dark-900 border border-white/5 rounded-lg hover:border-purple-500/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Package className="w-6 h-6 text-purple-400" />
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Package Management</h3>
                    <p className="text-gray-400 text-sm">Create & manage packages</p>
                  </button>

                  <button
                    onClick={() => navigate('/superadmin/users')}
                    className="group p-4 bg-dark-900 border border-white/5 rounded-lg hover:border-green-500/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-6 h-6 text-green-400" />
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">User Management</h3>
                    <p className="text-gray-400 text-sm">View all system users</p>
                  </button>

                  <button
                    onClick={() => navigate('/superadmin/individual-users')}
                    className="group p-4 bg-dark-900 border border-white/5 rounded-lg hover:border-orange-500/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <UserPlus className="w-6 h-6 text-orange-400" />
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Individual Users</h3>
                    <p className="text-gray-400 text-sm">Manage individual users</p>
                  </button>
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">System Statistics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Institute Admins</p>
                        <p className="text-gray-400 text-sm">Total admin accounts</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{stats?.totalAdmins || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Staff Members</p>
                        <p className="text-gray-400 text-sm">Total staff accounts</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{stats?.totalStaff || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Status */}
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Status Overview</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-dark-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Active Institutes</span>
                      <span className="text-green-400 font-semibold">{stats?.activeInstitutes || 0}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{
                          width: `${((stats?.activeInstitutes || 0) / (stats?.totalInstitutes || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-dark-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Paid Subscriptions</span>
                      <span className="text-emerald-400 font-semibold">
                        {(stats?.activeSubscriptions || 0) - (stats?.pendingPayments || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full"
                        style={{
                          width: `${(((stats?.activeSubscriptions || 0) - (stats?.pendingPayments || 0)) / (stats?.activeSubscriptions || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-dark-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Pending Payments</span>
                      <span className="text-orange-400 font-semibold">{stats?.pendingPayments || 0}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-orange-400 h-2 rounded-full"
                        style={{
                          width: `${((stats?.pendingPayments || 0) / (stats?.activeSubscriptions || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Total Institutes</span>
                    </div>
                    <span className="text-white font-semibold">{stats?.totalInstitutes || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Total Students</span>
                    </div>
                    <span className="text-white font-semibold">{stats?.totalStudents || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Subscriptions</span>
                    </div>
                    <span className="text-white font-semibold">{stats?.activeSubscriptions || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Revenue</span>
                    </div>
                    <span className="text-white font-semibold">
                      ₹{((stats?.totalRevenue || 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminSidebar>
  );
};

export default SuperAdminDashboard;
