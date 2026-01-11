import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  Briefcase,
  X,
  Loader2,
  Phone,
  ChevronRight,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'institute_admin' | 'staff' | 'student';
  instituteId: string | null;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
}

const SuperAdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [instituteFilter, setInstituteFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'individual' | 'institute'>('all');

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState<'total' | 'individual' | 'institute' | 'admins' | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchInstitutes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, instituteFilter, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutes(data);
      }
    } catch (err) {
      console.error('Failed to fetch institutes:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Institute filter
    if (instituteFilter !== 'all') {
      filtered = filtered.filter((user) => user.instituteId === instituteFilter);
    }

    // User type filter
    if (userTypeFilter === 'individual') {
      filtered = filtered.filter((user) => !user.instituteId && (user.role === 'user' || user.role === 'admin'));
    } else if (userTypeFilter === 'institute') {
      filtered = filtered.filter(
        (user) => user.instituteId || user.role === 'institute_admin' || user.role === 'staff' || user.role === 'student'
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'institute_admin':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'staff':
        return <Briefcase className="w-5 h-5 text-green-400" />;
      case 'student':
        return <GraduationCap className="w-5 h-5 text-orange-400" />;
      default:
        return <UsersIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'institute_admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'staff':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'student':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInstituteName = (instituteId: string | null) => {
    if (!instituteId) return 'Individual User';
    const institute = institutes.find((inst) => inst.id === instituteId);
    return institute ? institute.name : 'Unknown Institute';
  };

  const openDetailModal = (type: 'total' | 'individual' | 'institute' | 'admins') => {
    setModalType(type);
    let filteredList: User[] = [];

    switch (type) {
      case 'total':
        filteredList = users;
        break;
      case 'individual':
        filteredList = users.filter((u) => !u.instituteId && (u.role === 'user' || u.role === 'admin'));
        break;
      case 'institute':
        filteredList = users.filter(
          (u) => u.instituteId || u.role === 'institute_admin' || u.role === 'staff' || u.role === 'student'
        );
        break;
      case 'admins':
        filteredList = users.filter((u) => u.role === 'admin' || u.role === 'superadmin' || u.role === 'institute_admin');
        break;
    }

    setModalUsers(filteredList);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setModalType(null);
    setModalUsers([]);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'total':
        return 'All Users';
      case 'individual':
        return 'Individual Users';
      case 'institute':
        return 'Institute Users';
      case 'admins':
        return 'All Admins';
      default:
        return 'Users';
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setTogglingUserId(userId);
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user status');
      }

      const data = await response.json();
      toast.success(data.message);

      // Update users list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );

      // Update modal users list
      setModalUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );

      setTogglingUserId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
      setTogglingUserId(null);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Statistics
  const stats = {
    total: users.length,
    individual: users.filter((u) => !u.instituteId && (u.role === 'user' || u.role === 'admin')).length,
    instituteUsers: users.filter(
      (u) => u.instituteId || u.role === 'institute_admin' || u.role === 'staff' || u.role === 'student'
    ).length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'superadmin' || u.role === 'institute_admin')
      .length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-white/10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-neon-blue" />
                User Management
              </h1>
              <p className="text-gray-400 mt-1">View and manage all platform users</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => openDetailModal('total')}
              className="bg-dark-900 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs uppercase">Total Users</p>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </button>
            <button
              onClick={() => openDetailModal('individual')}
              className="bg-dark-900 border border-white/10 rounded-lg p-4 hover:border-neon-blue/50 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs uppercase">Individual Users</p>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-neon-blue transition-colors" />
              </div>
              <p className="text-neon-blue text-2xl font-bold">{stats.individual}</p>
            </button>
            <button
              onClick={() => openDetailModal('institute')}
              className="bg-dark-900 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs uppercase">Institute Users</p>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-purple-400 text-2xl font-bold">{stats.instituteUsers}</p>
            </button>
            <button
              onClick={() => openDetailModal('admins')}
              className="bg-dark-900 border border-white/10 rounded-lg p-4 hover:border-red-500/50 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs uppercase">Total Admins</p>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
              </div>
              <p className="text-red-400 text-2xl font-bold">{stats.admins}</p>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
              />
            </div>

            {/* User Type Filter */}
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as any)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All User Types</option>
              <option value="individual">Individual Users</option>
              <option value="institute">Institute Users</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="institute_admin">Institute Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
            </select>

            {/* Institute Filter */}
            <select
              value={instituteFilter}
              onChange={(e) => setInstituteFilter(e.target.value)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All Institutes</option>
              <option value="null">Individual (No Institute)</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="container mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>
        )}

        <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Institute</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(user.role)}
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs border ${
                          user.instituteId
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {user.instituteId ? 'Institute' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        {user.instituteId && <Building2 className="w-4 h-4" />}
                        <span className="text-sm">{getInstituteName(user.instituteId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.onboardingCompleted ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <UserCheck className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 text-sm">
                          <UserX className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="bg-dark-900 border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Showing <span className="text-white font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="text-white font-semibold">
                    {Math.min(indexOfLastItem, filteredUsers.length)}
                  </span>{' '}
                  of <span className="text-white font-semibold">{filteredUsers.length}</span> users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => paginate(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-neon-blue text-white'
                                : 'bg-dark-800 border border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-neon-blue" />
                {getModalTitle()}
                <span className="text-gray-400 text-lg">({modalUsers.length})</span>
              </h2>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {modalUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modalUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-dark-900 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Role</p>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              <span className={`px-3 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 text-xs mb-1">User Type</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs border ${
                                user.instituteId
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {user.instituteId ? 'Institute' : 'Individual'}
                            </span>
                          </div>

                          {user.instituteId && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Institute</p>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm">{getInstituteName(user.instituteId)}</span>
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-gray-500 text-xs mb-1">Status</p>
                            {user.onboardingCompleted ? (
                              <span className="flex items-center gap-1 text-green-400 text-sm">
                                <UserCheck className="w-4 h-4" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-400 text-sm">
                                <UserX className="w-4 h-4" />
                                Pending Setup
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-gray-500 text-xs mb-1">Joined</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300 text-sm">{formatDate(user.createdAt)}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 text-xs mb-1">User ID</p>
                            <span className="text-gray-400 text-xs font-mono">{user.id.substring(0, 16)}...</span>
                          </div>

                          <div>
                            <p className="text-gray-500 text-xs mb-1">Account Status</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs border ${
                                user.isActive
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {user.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          {user.role !== 'superadmin' && (
                            <button
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              disabled={togglingUserId === user.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                user.isActive
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                                  : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {togglingUserId === user.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : user.isActive ? (
                                <>
                                  <Ban className="w-4 h-4" />
                                  <span>Deactivate User</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Activate User</span>
                                </>
                              )}
                            </button>
                          )}
                          {user.role === 'superadmin' && (
                            <p className="text-gray-500 text-xs italic">Super admin accounts cannot be deactivated</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={closeDetailModal}
                className="w-full bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;
