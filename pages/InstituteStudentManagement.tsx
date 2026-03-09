import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Key,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  User as UserIcon,
  Lock,
  GraduationCap,
  Power,
  Eye,
  EyeOff,
  Briefcase,
  TrendingUp,
  SkipForward,
  Target,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface Student {
  id: string;
  instituteId: string;
  userId: string;
  enrollmentNumber?: string;
  batch?: string;
  course?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  };
}

interface DashboardStats {
  studentCount: number;
  studentLimit: number;
  remainingSlots: number;
  hasActiveSubscription: boolean;
}

const InstituteStudentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    enrollmentNumber: '',
    batch: '',
    course: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('instituteAdminToken');

      // Don't make API call if no token
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/institute-admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch students
      const studentsResponse = await fetch(`${API_BASE_URL}/institute-admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsResponse.json();
      setStudents(studentsData.students || studentsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }

      setSuccess('Student added successfully!');
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        enrollmentNumber: '',
        batch: '',
        course: '',
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      // Update user details
      const userResponse = await fetch(
        `${API_BASE_URL}/institute-admin/students/${selectedStudent.userId}/details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          }),
        }
      );

      if (!userResponse.ok) {
        const data = await userResponse.json();
        throw new Error(data.error || 'Failed to update student');
      }

      // Update institute student details
      const studentResponse = await fetch(
        `${API_BASE_URL}/institute-admin/students/${selectedStudent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            enrollmentNumber: formData.enrollmentNumber,
            batch: formData.batch,
            course: formData.course,
          }),
        }
      );

      if (!studentResponse.ok) {
        const data = await studentResponse.json();
        throw new Error(data.error || 'Failed to update student details');
      }

      setSuccess('Student updated successfully!');
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setError('');
    setSuccess('');

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(
        `${API_BASE_URL}/institute-admin/students/${selectedStudent.userId}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: passwordData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setSelectedStudent(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.user.firstName} ${student.user.lastName}?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students/${student.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      setSuccess('Student deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (student: Student) => {
    const action = student.user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${student.user.firstName} ${student.user.lastName}?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(
        `${API_BASE_URL}/institute-admin/students/${student.userId}/toggle-active`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle student status');
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      password: '',
      enrollmentNumber: student.enrollmentNumber || '',
      batch: student.batch || '',
      course: student.course || '',
    });
    setShowEditModal(true);
  };

  const openStatsModal = async (student: Student) => {
    setSelectedStudent(student);
    setStudentStats(null);
    setShowStatsModal(true);
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const res = await fetch(`${API_BASE_URL}/institute-admin/students/${student.userId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStudentStats(data.stats);
      else setError(data.error || 'Failed to load stats');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const openPasswordModal = (student: Student) => {
    setSelectedStudent(student);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-blue mx-auto mb-4" />
          <p className="text-gray-400">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-10 bg-dark-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/institute-admin')}
              className="p-2 hover:bg-dark-800 rounded-lg transition-all border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-neon-blue" />
                Student Management
              </h1>
              <p className="text-gray-400 mt-1">
                {stats && `${stats.studentCount} / ${stats.studentLimit} students`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={stats && stats.remainingSlots <= 0}
            className="bg-neon-blue text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            Add Student
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {stats && stats.remainingSlots <= 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Student Limit Reached</p>
              <p className="text-red-400/80 text-sm mt-1">
                You have reached your plan limit of {stats.studentLimit} students. Contact super admin to upgrade.
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or enrollment number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">
                        {searchTerm ? 'No students found matching your search' : 'No students yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-dark-900/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.user.firstName[0]}{student.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {student.user.firstName} {student.user.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Added {new Date(student.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{student.user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${student.user.isActive
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-500'
                            }`}
                        >
                          {student.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openStatsModal(student)}
                            className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                            title="View Stats"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPasswordModal(student)}
                            className="p-2 hover:bg-neon-purple/10 rounded-lg transition-all text-neon-purple"
                            title="Change Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(student)}
                            className={`p-2 rounded-lg transition-all ${student.user.isActive
                                ? 'hover:bg-yellow-500/10 text-yellow-500'
                                : 'hover:bg-green-500/10 text-green-500'
                              }`}
                            title={student.user.isActive ? 'Deactivate Student' : 'Activate Student'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-neon-blue" />
                  Add New Student
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-dark-900 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      First Name *
                    </label>
                    <div className="relative mt-2">
                      <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        required
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Last Name *
                    </label>
                    <div className="relative mt-2">
                      <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        required
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email *
                    </label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        required
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type={showAddPassword ? 'text' : 'password'}
                        required
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button type="button" onClick={() => setShowAddPassword(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                        {showAddPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.enrollmentNumber}
                      onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Batch
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Course
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-neon-blue" />
                  Edit Student
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-dark-900 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleEditStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.enrollmentNumber}
                      onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Batch
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Course
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Key className="w-6 h-6 text-neon-purple" />
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-dark-900 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-400 mb-6">
                Change password for {selectedStudent.user.firstName} {selectedStudent.user.lastName}
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {/* Student Stats Modal */}
      {showStatsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedStudent.user.firstName[0]}{selectedStudent.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h2>
                  <p className="text-gray-500 text-sm">{selectedStudent.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowStatsModal(false); setStudentStats(null); }}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-neon-blue" />
              </div>
            ) : studentStats ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-neon-blue" />
                      <span className="text-xs text-gray-500 uppercase font-bold">Total Jobs</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{studentStats.totalJobs}</p>
                    <p className="text-xs text-gray-500 mt-1">Today: {studentStats.todayApplications}</p>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-500 uppercase font-bold">Applied</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{studentStats.applied}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Direct: {studentStats.directApply} | External: {studentStats.externalApply}
                    </p>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <SkipForward className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-500 uppercase font-bold">Skipped</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">{studentStats.skipped}</p>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-neon-purple" />
                      <span className="text-xs text-gray-500 uppercase font-bold">Good Matches</span>
                    </div>
                    <p className="text-3xl font-bold text-neon-purple">{studentStats.goodMatches}</p>
                    <p className="text-xs text-gray-500 mt-1">Poor: {studentStats.poorMatches}</p>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-neon-blue" />
                      <span className="text-xs text-gray-500 uppercase font-bold">Success Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-neon-blue">{studentStats.successRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">Avg Score: {studentStats.avgMatchScore}/5</p>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase font-bold">External Apply</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-300">{studentStats.externalApply}</p>
                  </div>
                </div>

                {/* Daily Trend (Last 7 Days) */}
                <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Last 7 Days</h3>
                  <div className="space-y-2">
                    {studentStats.dailyTrend.map((day: any) => (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                          {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div
                            className="h-2 bg-green-400 rounded-full"
                            style={{ width: `${studentStats.totalJobs > 0 ? (day.applied / Math.max(...studentStats.dailyTrend.map((d: any) => d.applied + d.skipped), 1)) * 100 : 0}%`, minWidth: day.applied > 0 ? '4px' : '0' }}
                          />
                          <span className="text-xs text-green-400">{day.applied}</span>
                          {day.skipped > 0 && (
                            <>
                              <div
                                className="h-2 bg-yellow-400 rounded-full"
                                style={{ width: `${(day.skipped / Math.max(...studentStats.dailyTrend.map((d: any) => d.applied + d.skipped), 1)) * 100}%`, minWidth: '4px' }}
                              />
                              <span className="text-xs text-yellow-400">{day.skipped} skipped</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No application data found for this student.</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default InstituteStudentManagement;
