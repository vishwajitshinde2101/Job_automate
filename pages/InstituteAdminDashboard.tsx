import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2,
  Users,
  GraduationCap,
  Package as PackageIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  UserPlus,
  Loader2,
  Search,
  Edit2,
  Trash2,
  Key,
  Power,
  Mail,
  User as UserIcon,
  Lock,
  X,
  GitBranch,
  MapPin,
  Eye,
  EyeOff,
  Briefcase,
  SkipForward,
  Target,
  Zap,
  ExternalLink,
} from 'lucide-react';
import InstituteAdminSidebar from '../components/InstituteAdminSidebar';
import RoleManagement from '../components/RoleManagement';

interface DashboardData {
  institute: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    status: string;
  };
  subscription: {
    packageName: string;
    studentLimit: number;
    pricePerMonth: number;
    startDate: string;
    endDate: string;
    status: string;
    paymentStatus: string;
  } | null;
  stats: {
    studentCount: number;
    studentLimit: number;
    staffCount: number;
    remainingSlots: number;
    hasActiveSubscription: boolean;
  };
  staffCount: number;
  adminCount: number;
  canAddStudents: boolean;
  remainingSlots: number;
}

interface Student {
  id: string;
  instituteId: string;
  userId: string;
  enrollmentNumber?: string;
  batch?: string;
  course?: string;
  status: string;
  createdAt: string;
  branchId?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  };
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    location: string;
  } | null;
}

type TabType = 'overview' | 'students' | 'staff' | 'branches' | 'roles' | 'subscription' | 'settings' | 'profile';

interface Staff {
  id: string;
  instituteId: string;
  userId: string;
  role: string;
  addedBy: string;
  branchId?: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive?: boolean;
  };
  admin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Branch {
  id: string;
  instituteId: string;
  name: string;
  location: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  managers: {
    id: number;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
    };
  }[];
}

const InstituteAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [studentStaffFilter, setStudentStaffFilter] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 10;
  const [staffPage, setStaffPage] = useState(1);
  const STAFF_PER_PAGE = 10;
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState('');
  // Show/hide password states
  const [showStudentPwd, setShowStudentPwd] = useState(false);
  const [showAdminNewPwd, setShowAdminNewPwd] = useState(false);
  const [showAdminConfirmPwd, setShowAdminConfirmPwd] = useState(false);
  const [showStaffPwd, setShowStaffPwd] = useState(false);
  const [showBranchPwd, setShowBranchPwd] = useState(false);
  const [showBranchConfirmPwd, setShowBranchConfirmPwd] = useState(false);
  const [showBranchMgrNewPwd, setShowBranchMgrNewPwd] = useState(false);
  const [showBranchMgrConfirmPwd, setShowBranchMgrConfirmPwd] = useState(false);
  const [showAddMgrPwd, setShowAddMgrPwd] = useState(false);
  const [showAddMgrConfirmPwd, setShowAddMgrConfirmPwd] = useState(false);
  const [showStaffNewPwd, setShowStaffNewPwd] = useState(false);
  const [showStaffConfirmPwd, setShowStaffConfirmPwd] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showStaffPasswordModal, setShowStaffPasswordModal] = useState(false);
  const [showStaffStudentsModal, setShowStaffStudentsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffStudents, setStaffStudents] = useState<Student[]>([]);
  const [editStaffFormData, setEditStaffFormData] = useState({ firstName: '', lastName: '', email: '', role: '' });
  const [staffPasswordData, setStaffPasswordData] = useState({ password: '', confirmPassword: '' });

  // Branch state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [showBranchManagerPasswordModal, setShowBranchManagerPasswordModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedManager, setSelectedManager] = useState<Branch['managers'][0] | null>(null);
  const [addManagerFormData, setAddManagerFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [branchFormData, setBranchFormData] = useState({
    name: '', location: '',
    managerFirstName: '', managerLastName: '', managerEmail: '', managerPassword: '', confirmPassword: '',
  });
  const [editBranchFormData, setEditBranchFormData] = useState({ name: '', location: '', status: 'active' as 'active' | 'inactive' });
  const [branchManagerPasswordData, setBranchManagerPasswordData] = useState({ password: '', confirmPassword: '' });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<{ user: any; branch: any } | null>(null);
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    enrollmentNumber: '',
    batch: '',
    course: '',
    branchId: '',
  });

  const [staffFormData, setStaffFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'teacher',
    branchId: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Get admin email and role from localStorage
  const [adminEmail, setAdminEmail] = useState('');
  const [userRole, setUserRole] = useState('institute_admin');

  useEffect(() => {
    // Initialize user data from localStorage first so we have the role
    const adminUserStr = localStorage.getItem('instituteAdminUser');
    const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
    const role = adminUser?.role || 'institute_admin';
    if (adminUser) {
      setAdminEmail(adminUser.email || '');
      setUserRole(role);
    }

    fetchDashboardData();
    fetchStaff();
    fetchStudents();
    if (role === 'institute_admin') {
      fetchBranches();
    }
    if (role === 'branch_manager') {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'staff') {
      fetchStaff();
    } else if (activeTab === 'branches' && userRole === 'institute_admin') {
      fetchBranches();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab, userRole]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      // silent fail - localStorage data is fallback
    }
  };

  // Prevent staff from accessing admin-only tabs
  useEffect(() => {
    if (userRole === 'staff' && (activeTab === 'subscription' || activeTab === 'settings' || activeTab === 'roles' || activeTab === 'branches')) {
      setActiveTab('overview');
      toast.error('Access denied. This section is only available to administrators.');
    }
  }, [activeTab, userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('instituteAdminToken');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || data);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      toast.error(err.message || 'Failed to load students');
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      toast.error(err.message || 'Failed to load staff');
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load branches');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (branchFormData.managerPassword !== branchFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: branchFormData.name,
          location: branchFormData.location,
          managerFirstName: branchFormData.managerFirstName,
          managerLastName: branchFormData.managerLastName,
          managerEmail: branchFormData.managerEmail,
          managerPassword: branchFormData.managerPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create branch');
      toast.success('Branch created successfully!');
      setShowAddBranchModal(false);
      setBranchFormData({ name: '', location: '', managerFirstName: '', managerLastName: '', managerEmail: '', managerPassword: '', confirmPassword: '' });
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editBranchFormData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update branch');
      toast.success('Branch updated successfully!');
      setShowEditBranchModal(false);
      setSelectedBranch(null);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (!confirm(`Are you sure you want to delete branch "${branch.name}"?`)) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${branch.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete branch');
      }
      toast.success('Branch deleted successfully!');
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBranchManagerToggleActive = async (branch: Branch, manager: Branch['managers'][0]) => {
    const action = manager.user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${manager.user.firstName} ${manager.user.lastName}?`)) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${branch.id}/managers/${manager.id}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle branch manager status');
      toast.success(data.message);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBranchManagerPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !selectedManager) return;
    if (branchManagerPasswordData.password !== branchManagerPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (branchManagerPasswordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${selectedBranch.id}/managers/${selectedManager.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: branchManagerPasswordData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');
      toast.success('Branch manager password updated successfully!');
      setShowBranchManagerPasswordModal(false);
      setSelectedBranch(null);
      setSelectedManager(null);
      setBranchManagerPasswordData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteBranchManager = async (branch: Branch, manager: Branch['managers'][0]) => {
    if (!confirm(`Are you sure you want to remove ${manager.user.firstName} ${manager.user.lastName} as branch manager?`)) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${branch.id}/managers/${manager.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove branch manager');
      }
      toast.success('Branch manager removed successfully!');
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    if (addManagerFormData.password !== addManagerFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/branches/${selectedBranch.id}/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: addManagerFormData.firstName,
          lastName: addManagerFormData.lastName,
          email: addManagerFormData.email,
          password: addManagerFormData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add branch manager');
      toast.success('Branch manager added successfully!');
      setShowAddManagerModal(false);
      setSelectedBranch(null);
      setAddManagerFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Staff enhanced handlers
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editStaffFormData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update staff');
      toast.success('Staff updated successfully!');
      setShowEditStaffModal(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStaffPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (staffPasswordData.password !== staffPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (staffPasswordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${selectedStaff.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: staffPasswordData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update staff password');
      toast.success('Staff password updated successfully!');
      setShowStaffPasswordModal(false);
      setSelectedStaff(null);
      setStaffPasswordData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStaffToggleActive = async (member: Staff) => {
    const action = member.user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${member.user.firstName} ${member.user.lastName}?`)) return;
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${member.userId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle staff status');
      toast.success(data.message);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fetchStaffStudents = async (member: Staff) => {
    setSelectedStaff(member);
    setStaffStudents([]);
    setShowStaffStudentsModal(true);
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${member.userId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch students');
      setStaffStudents(data.students || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

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

      toast.success('Student added successfully!');
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        enrollmentNumber: '',
        batch: '',
        course: '',
        branchId: '',
      });
      fetchStudents();
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;


    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      await fetch(`${API_BASE_URL}/institute-admin/students/${selectedStudent.userId}/details`, {
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
      });

      await fetch(`${API_BASE_URL}/institute-admin/students/${selectedStudent.id}`, {
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
      });

      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;


    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
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

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setSelectedStudent(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (
      !confirm(`Are you sure you want to delete ${student.user.firstName} ${student.user.lastName}?`)
    ) {
      return;
    }


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

      toast.success('Student deleted successfully!');
      fetchStudents();
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (student: Student) => {
    const action = student.user.isActive ? 'deactivate' : 'activate';
    if (
      !confirm(
        `Are you sure you want to ${action} ${student.user.firstName} ${student.user.lastName}?`
      )
    ) {
      return;
    }


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
      toast.success(data.message);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message);
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

  const openPasswordModal = (student: Student) => {
    setSelectedStudent(student);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
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
      else toast.error(data.error || 'Failed to load stats');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add staff');
      }

      toast.success('Staff member added successfully!');
      setShowAddStaffModal(false);
      setStaffFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'teacher',
        branchId: '',
      });
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (
      !confirm(
        `Are you sure you want to remove ${staffMember.user.firstName} ${staffMember.user.lastName} from staff?`
      )
    ) {
      return;
    }


    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${staffMember.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove staff');
      }

      toast.success('Staff member removed successfully!');
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditSettings = () => {
    setSettingsFormData({
      name: institute.name,
      phone: institute.phone || '',
      address: institute.address || '',
      website: institute.website || '',
    });
    setIsEditingSettings(true);
  };

  const handleCancelEditSettings = () => {
    setIsEditingSettings(false);
    setSettingsFormData({
      name: '',
      phone: '',
      address: '',
      website: '',
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/institute/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast.success('Institute details updated successfully!');
      setIsEditingSettings(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFormData.firstName || !profileFormData.lastName) {
      toast.error('First name and last name are required');
      return;
    }
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/institute-admin/my-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileFormData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      // Update localStorage user data
      const adminUserStr = localStorage.getItem('instituteAdminUser');
      if (adminUserStr) {
        const adminUser = JSON.parse(adminUserStr);
        localStorage.setItem('instituteAdminUser', JSON.stringify({
          ...adminUser,
          firstName: profileFormData.firstName,
          lastName: profileFormData.lastName,
        }));
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
      studentBranchFilter === '' ||
      (studentBranchFilter === 'hq' ? !student.branchId : String(student.branchId) === studentBranchFilter);
    const matchesStaff =
      studentStaffFilter === '' || student.admin?.id === studentStaffFilter;
    return matchesSearch && matchesBranch && matchesStaff;
  });

  const studentTotalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * STUDENTS_PER_PAGE,
    studentPage * STUDENTS_PER_PAGE
  );

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.user.firstName.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.user.lastName.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(staffSearchTerm.toLowerCase());
    const matchesRole = staffRoleFilter === '' || member.role === staffRoleFilter;
    const matchesStatus =
      staffStatusFilter === '' ||
      (staffStatusFilter === 'active' && member.user.isActive !== false) ||
      (staffStatusFilter === 'inactive' && member.user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const staffTotalPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE);
  const paginatedStaff = filteredStaff.slice(
    (staffPage - 1) * STAFF_PER_PAGE,
    staffPage * STAFF_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-blue mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="bg-dark-800 border border-red-500/20 rounded-2xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-2">Error</h2>
          <p className="text-gray-400 text-center">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => {
              localStorage.removeItem('instituteAdminToken');
              localStorage.removeItem('instituteAdminUser');
              navigate('/institute-admin/login');
            }}
            className="mt-6 w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const { institute, subscription, stats } = dashboardData!;
  const usagePercentage =
    stats.studentLimit > 0 ? (stats.studentCount / stats.studentLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <InstituteAdminSidebar
        activeSection={activeTab}
        onSectionChange={setActiveTab}
        instituteName={institute.name}
        adminEmail={adminEmail}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (() => {
            // Compute branch-wise stats from local state
            const branchStats = branches.map((branch: any) => ({
              id: String(branch.id),
              name: branch.name,
              location: branch.location,
              status: branch.status,
              staffCount: staff.filter((s: any) => String(s.branchId) === String(branch.id)).length,
              studentCount: students.filter((s: any) => String(s.branchId) === String(branch.id)).length,
              managers: branch.managers?.length || 0,
            }));
            const hqStaffCount = staff.filter((s: any) => !s.branchId).length;
            const hqStudentCount = students.filter((s: any) => !s.branchId).length;

            // Staff report: count students per staff
            const staffReport = staff.map((s: any) => ({
              ...s,
              myStudentCount: students.filter((st: any) => st.admin?.id === s.userId).length,
            }));

            // Branch Manager: completely separate overview
            if (userRole === 'branch_manager') {
              const activeStudents = students.filter((s: any) => s.user?.isActive !== false).length;
              const activeStaff = staff.filter((s: any) => s.user?.isActive !== false).length;
              const recentStudents = [...students].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
              const staffWithCounts = staff.map((s: any) => ({
                ...s,
                myStudentCount: students.filter((st: any) => st.admin?.id === s.userId).length,
              }));
              const usagePct = stats.studentLimit > 0 ? Math.min((stats.studentCount / stats.studentLimit) * 100, 100) : 0;
              const adminUser = (() => { try { return JSON.parse(localStorage.getItem('instituteAdminUser') || '{}'); } catch { return {}; } })();

              return (
                <div className="space-y-6">
                  {/* Branch Header */}
                  <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                          <GitBranch className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Branch Dashboard</p>
                          <h2 className="text-2xl font-bold text-white">{profileData?.branch?.name || 'My Branch'}</h2>
                          {profileData?.branch?.location && <p className="text-gray-400 text-sm mt-0.5">{profileData.branch.location}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${profileData?.branch?.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-400'}`}>
                          {profileData?.branch?.status || 'active'}
                        </span>
                        <p className="text-gray-500 text-xs mt-2">Manager: {adminUser.firstName} {adminUser.lastName}</p>
                        <p className="text-gray-600 text-xs">{institute.name}</p>
                      </div>
                    </div>
                    {/* Usage bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Student Slots Used</span>
                        <span className="text-xs text-gray-400">{stats.studentCount} / {stats.studentLimit}</span>
                      </div>
                      <div className="w-full h-2 bg-dark-900/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-yellow-500' : 'bg-gradient-to-r from-neon-blue to-neon-purple'}`} style={{ width: `${usagePct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-blue/40 transition-all">
                      <div className="p-2 bg-neon-blue/10 rounded-lg w-fit mb-3"><GraduationCap className="w-5 h-5 text-neon-blue" /></div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Total Students</p>
                      <p className="text-3xl font-bold text-white">{students.length}</p>
                      <p className="text-xs text-gray-500 mt-1">in this branch</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-green-500/40 transition-all">
                      <div className="p-2 bg-green-500/10 rounded-lg w-fit mb-3"><GraduationCap className="w-5 h-5 text-green-500" /></div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Active Students</p>
                      <p className="text-3xl font-bold text-white">{activeStudents}</p>
                      <p className="text-xs text-gray-500 mt-1">currently active</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-purple/40 transition-all">
                      <div className="p-2 bg-neon-purple/10 rounded-lg w-fit mb-3"><Users className="w-5 h-5 text-neon-purple" /></div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Total Staff</p>
                      <p className="text-3xl font-bold text-white">{staff.length}</p>
                      <p className="text-xs text-gray-500 mt-1">in this branch</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-yellow-500/40 transition-all">
                      <div className="p-2 bg-yellow-500/10 rounded-lg w-fit mb-3"><Users className="w-5 h-5 text-yellow-500" /></div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Active Staff</p>
                      <p className="text-3xl font-bold text-white">{activeStaff}</p>
                      <p className="text-xs text-gray-500 mt-1">currently active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recently Added Students */}
                    <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-neon-blue" />
                        <h3 className="text-white font-bold">Recently Added Students</h3>
                      </div>
                      {recentStudents.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 text-sm">No students added yet</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {recentStudents.map((s: any) => (
                            <div key={s.id} className="px-6 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-neon-blue font-bold text-xs">{s.user?.firstName?.[0]}{s.user?.lastName?.[0]}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{s.user?.firstName} {s.user?.lastName}</p>
                                <p className="text-gray-500 text-xs truncate">{s.user?.email}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.user?.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                  {s.user?.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                                <p className="text-gray-600 text-xs mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Staff Performance */}
                    <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                        <Users className="w-5 h-5 text-neon-purple" />
                        <h3 className="text-white font-bold">Staff Overview</h3>
                      </div>
                      {staffWithCounts.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 text-sm">No staff in this branch</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {staffWithCounts.map((s: any) => (
                            <div key={s.id} className="px-6 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-neon-purple font-bold text-xs">{s.user?.firstName?.[0]}{s.user?.lastName?.[0]}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{s.user?.firstName} {s.user?.lastName}</p>
                                <p className="text-gray-500 text-xs capitalize">{s.role || 'Staff'}</p>
                              </div>
                              <div className="text-right flex-shrink-0 flex items-center gap-3">
                                <div className="text-center">
                                  <p className="text-neon-blue font-bold text-sm">{s.myStudentCount}</p>
                                  <p className="text-gray-600 text-xs">students</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.user?.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                  {s.user?.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
            <div className="space-y-6">
              {/* Subscription Alert */}
              {!stats.hasActiveSubscription && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">No Active Subscription</p>
                    <p className="text-red-400/80 text-sm mt-1">Please contact the super admin to activate a subscription package.</p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-blue/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-neon-blue/10 rounded-lg"><GraduationCap className="w-5 h-5 text-neon-blue" /></div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-white">{stats.studentCount}</p>
                  {userRole === 'branch_manager'
                    ? <p className="text-xs text-gray-500 mt-1">in this branch</p>
                    : <p className="text-xs text-gray-500 mt-1">of {stats.studentLimit} limit</p>
                  }
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-purple/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-neon-purple/10 rounded-lg"><Users className="w-5 h-5 text-neon-purple" /></div>
                  </div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Staff</p>
                  <p className="text-3xl font-bold text-white">{stats.staffCount}</p>
                  {userRole === 'branch_manager'
                    ? <p className="text-xs text-gray-500 mt-1">in this branch</p>
                    : <p className="text-xs text-gray-500 mt-1">across all branches</p>
                  }
                </div>

                {userRole === 'institute_admin' && (
                  <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-blue/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-neon-blue/10 rounded-lg"><GitBranch className="w-5 h-5 text-neon-blue" /></div>
                    </div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Total Branches</p>
                    <p className="text-3xl font-bold text-white">{branches.length}</p>
                    <p className="text-xs text-gray-500 mt-1">+ Headquarter</p>
                  </div>
                )}

                {userRole !== 'branch_manager' && (
                  <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg"><PackageIcon className="w-5 h-5 text-yellow-500" /></div>
                    </div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Plan</p>
                    <p className="text-lg font-bold text-white">{subscription?.packageName || 'No Plan'}</p>
                    {subscription && <p className="text-xs text-gray-500 mt-1">Valid till {new Date(subscription.endDate).toLocaleDateString()}</p>}
                  </div>
                )}
              </div>

              {/* Student Usage Bar — hidden for branch managers */}
              {userRole !== 'branch_manager' && <div className="bg-dark-800 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Student Limit Usage</h3>
                  <span className="text-xs text-gray-400">{stats.studentCount} / {stats.studentLimit} ({usagePercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' : usagePercentage >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-neon-blue to-neon-purple'}`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }} />
                </div>
                {usagePercentage >= 100 && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Student limit reached.</p>}
                {usagePercentage >= 80 && usagePercentage < 100 && <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Approaching limit.</p>}
              </div>}

              {/* Branch-wise Summary */}
              {userRole === 'institute_admin' && <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-neon-blue" />
                  <h3 className="text-white font-bold">Branch-wise Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-900">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Branch</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Location</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Managers</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Staff</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Students</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {/* Headquarter row */}
                      <tr className="hover:bg-dark-900/40 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-500/10 rounded"><GitBranch className="w-4 h-4 text-gray-400" /></div>
                            <span className="text-white font-medium text-sm">Headquarter</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">—</td>
                        <td className="px-6 py-4 text-center"><span className="text-white font-bold">{dashboardData?.adminCount || 0}</span></td>
                        <td className="px-6 py-4 text-center"><span className="text-neon-purple font-bold">{hqStaffCount}</span></td>
                        <td className="px-6 py-4 text-center"><span className="text-neon-blue font-bold">{hqStudentCount}</span></td>
                        <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500">active</span></td>
                      </tr>
                      {branchStats.map((b: any) => (
                        <tr key={b.id} className="hover:bg-dark-900/40 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-neon-blue/10 rounded"><GitBranch className="w-4 h-4 text-neon-blue" /></div>
                              <span className="text-white font-medium text-sm">{b.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{b.location || '—'}</td>
                          <td className="px-6 py-4 text-center"><span className="text-white font-bold">{b.managers}</span></td>
                          <td className="px-6 py-4 text-center"><span className="text-neon-purple font-bold">{b.staffCount}</span></td>
                          <td className="px-6 py-4 text-center"><span className="text-neon-blue font-bold">{b.studentCount}</span></td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                      {branches.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500 text-sm">No branches created yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>}

              {/* Staff Report */}
              <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <Users className="w-5 h-5 text-neon-purple" />
                  <h3 className="text-white font-bold">Staff Report</h3>
                  <span className="ml-auto text-xs text-gray-500">{staff.length} members</span>
                </div>
                {staff.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">No staff members yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-dark-900">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Staff Member</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Branch</th>
                          <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Students</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {staffReport.map((s: any) => {
                          const memberBranch = branches.find((b: any) => String(b.id) === String(s.branchId));
                          return (
                            <tr key={s.id} className="hover:bg-dark-900/40 transition-all">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center">
                                    <span className="text-neon-purple font-bold text-xs">{s.user.firstName[0]}{s.user.lastName[0]}</span>
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{s.user.firstName} {s.user.lastName}</p>
                                    <p className="text-gray-500 text-xs">{s.user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm capitalize">{s.role || '—'}</td>
                              <td className="px-6 py-4">
                                {memberBranch ? (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-neon-blue/10 text-neon-blue">{memberBranch.name}</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400">Headquarter</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.myStudentCount > 0 ? 'bg-neon-blue/10 text-neon-blue' : 'bg-gray-500/10 text-gray-500'}`}>
                                  {s.myStudentCount}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.user.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {s.user.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Student Management</h2>
                  <p className="text-gray-400 mt-1">
                    {stats.studentCount} / {stats.studentLimit} students
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={stats.remainingSlots <= 0}
                  className="bg-neon-blue text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Student
                </button>
              </div>

              {stats.remainingSlots <= 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">Student Limit Reached</p>
                    <p className="text-red-400/80 text-sm mt-1">
                      You have reached your plan limit of {stats.studentLimit} students. Contact super
                      admin to upgrade.
                    </p>
                  </div>
                </div>
              )}

              {/* Search + Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or enrollment number..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setStudentPage(1); }}
                    className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                  />
                </div>
                {userRole !== 'branch_manager' && (
                  <select
                    value={studentBranchFilter}
                    onChange={(e) => { setStudentBranchFilter(e.target.value); setStudentPage(1); }}
                    className="bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none transition-all"
                  >
                    <option value="">All Branches</option>
                    <option value="hq">Headquarter</option>
                    {branches.map((branch: any) => (
                      <option key={branch.id} value={String(branch.id)}>{branch.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={studentStaffFilter}
                  onChange={(e) => { setStudentStaffFilter(e.target.value); setStudentPage(1); }}
                  className="bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none transition-all"
                >
                  <option value="">All Staff</option>
                  {staff.map((s: any) => (
                    <option key={s.userId} value={s.userId}>{s.user.firstName} {s.user.lastName}</option>
                  ))}
                </select>
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
                        {userRole !== 'branch_manager' && (
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                        )}
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Added By
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
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={userRole === 'branch_manager' ? 5 : 6} className="px-6 py-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">
                              {searchTerm ? 'No students found matching your search' : 'No students yet'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-dark-900/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {student.user.firstName[0]}
                                    {student.user.lastName[0]}
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
                            {userRole !== 'branch_manager' && (
                              <td className="px-6 py-4">
                                {student.branch ? (
                                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-neon-blue/10 text-neon-blue">
                                    {student.branch.name}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400">
                                    Headquarter
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {student.admin
                                ? `${student.admin.firstName} ${student.admin.lastName}`
                                : '-'}
                            </td>
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
                                  title={
                                    student.user.isActive ? 'Deactivate Student' : 'Activate Student'
                                  }
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

              {/* Pagination */}
              {studentTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-400 text-sm">
                    Showing {(studentPage - 1) * STUDENTS_PER_PAGE + 1}–{Math.min(studentPage * STUDENTS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      disabled={studentPage === 1}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:border-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: studentTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setStudentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          page === studentPage
                            ? 'bg-neon-blue text-black'
                            : 'bg-dark-800 border border-gray-700 text-gray-400 hover:border-neon-blue hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setStudentPage((p) => Math.min(studentTotalPages, p + 1))}
                      disabled={studentPage === studentTotalPages}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:border-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Staff Management</h2>
                  <p className="text-gray-400 mt-1">{staff.length} staff members</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="bg-neon-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(188,19,254,0.3)]"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Staff
                </button>
              </div>

              {/* Search + Filter Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={staffSearchTerm}
                    onChange={(e) => { setStaffSearchTerm(e.target.value); setStaffPage(1); }}
                    className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                  />
                </div>
                <select
                  value={staffRoleFilter}
                  onChange={(e) => { setStaffRoleFilter(e.target.value); setStaffPage(1); }}
                  className="bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all min-w-[160px]"
                >
                  <option value="">All Roles</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="counselor">Counselor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="support">Support Staff</option>
                </select>
                <select
                  value={staffStatusFilter}
                  onChange={(e) => { setStaffStatusFilter(e.target.value); setStaffPage(1); }}
                  className="bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Staff Table */}
              <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-900 border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Added By
                        </th>
                        {userRole !== 'branch_manager' && (
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                        )}
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredStaff.length === 0 ? (
                        <tr>
                          <td colSpan={userRole === 'branch_manager' ? 7 : 8} className="px-6 py-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">
                              {staffSearchTerm ? 'No staff found matching your search' : 'No staff members yet'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedStaff.map((member) => (
                          <tr key={member.id} className="hover:bg-dark-900/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {member.user.firstName[0]}
                                    {member.user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {member.user.firstName} {member.user.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">ID: {member.userId.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{member.user.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-purple/10 text-neon-purple capitalize">
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.user.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {member.user.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {member.admin?.firstName?.[0] || 'A'}
                                  </span>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {member.admin ? `${member.admin.firstName} ${member.admin.lastName}` : 'Admin'}
                                </span>
                              </div>
                            </td>
                            {userRole !== 'branch_manager' && (
                              <td className="px-6 py-4">
                                {member.branchId ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400">
                                    {branches.find((b: any) => String(b.id) === String(member.branchId))?.name || 'Branch'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400">
                                    Headquarter
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 text-gray-400">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {userRole === 'institute_admin' && (
                                  <>
                                    <button
                                      onClick={() => { setSelectedStaff(member); setEditStaffFormData({ firstName: member.user.firstName, lastName: member.user.lastName, email: member.user.email, role: member.role }); setShowEditStaffModal(true); }}
                                      className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                                      title="Edit Staff"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => { setSelectedStaff(member); setStaffPasswordData({ password: '', confirmPassword: '' }); setShowStaffPasswordModal(true); }}
                                      className="p-2 hover:bg-neon-purple/10 rounded-lg transition-all text-neon-purple"
                                      title="Change Password"
                                    >
                                      <Key className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleStaffToggleActive(member)}
                                      className={`p-2 rounded-lg transition-all ${member.user.isActive !== false ? 'hover:bg-yellow-500/10 text-yellow-500' : 'hover:bg-green-500/10 text-green-500'}`}
                                      title={member.user.isActive !== false ? 'Deactivate' : 'Activate'}
                                    >
                                      <Power className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => fetchStaffStudents(member)}
                                  className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                                  title="View Students"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {userRole === 'institute_admin' && (
                                  <button
                                    onClick={() => handleDeleteStaff(member)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                                    title="Remove Staff"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {staffTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-400 text-sm">
                    Showing {(staffPage - 1) * STAFF_PER_PAGE + 1}–{Math.min(staffPage * STAFF_PER_PAGE, filteredStaff.length)} of {filteredStaff.length} staff
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                      disabled={staffPage === 1}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:border-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: staffTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setStaffPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          page === staffPage
                            ? 'bg-neon-blue text-black'
                            : 'bg-dark-800 border border-gray-700 text-gray-400 hover:border-neon-blue hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setStaffPage((p) => Math.min(staffTotalPages, p + 1))}
                      disabled={staffPage === staffTotalPages}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:border-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Branch Management</h2>
                  <p className="text-gray-400 mt-1">{branches.length} branches</p>
                </div>
                <button
                  onClick={() => setShowAddBranchModal(true)}
                  className="bg-neon-blue text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                >
                  <GitBranch className="w-5 h-5" />
                  Add Branch
                </button>
              </div>

              {branches.length === 0 ? (
                <div className="bg-dark-800 border border-white/10 rounded-xl p-12 text-center">
                  <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No branches yet. Create your first branch.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-neon-blue/30 transition-all">
                      {/* Branch Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-neon-blue/10 rounded-lg">
                            <GitBranch className="w-6 h-6 text-neon-blue" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-white font-bold text-lg">{branch.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${branch.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {branch.status}
                              </span>
                            </div>
                            {branch.location && (
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {branch.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => { setSelectedBranch(branch); setEditBranchFormData({ name: branch.name, location: branch.location || '', status: branch.status }); setShowEditBranchModal(true); }}
                            className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                            title="Edit Branch"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedBranch(branch); setAddManagerFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }); setShowAddManagerModal(true); }}
                            className="p-2 hover:bg-green-500/10 rounded-lg transition-all text-green-500"
                            title="Add Manager"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(branch)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Managers List */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Branch Managers ({branch.managers.length})
                        </p>
                        {branch.managers.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No managers assigned yet</p>
                        ) : (
                          branch.managers.map((mgr) => (
                            <div key={mgr.id} className="flex items-center justify-between bg-dark-900/60 rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center">
                                  <span className="text-neon-purple font-bold text-xs">
                                    {mgr.user.firstName[0]}{mgr.user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{mgr.user.firstName} {mgr.user.lastName}</p>
                                  <p className="text-gray-400 text-xs">{mgr.user.email}</p>
                                </div>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${mgr.user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {mgr.user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setSelectedBranch(branch); setSelectedManager(mgr); setBranchManagerPasswordData({ password: '', confirmPassword: '' }); setShowBranchManagerPasswordModal(true); }}
                                  className="p-2 hover:bg-neon-purple/10 rounded-lg transition-all text-neon-purple"
                                  title="Change Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleBranchManagerToggleActive(branch, mgr)}
                                  className={`p-2 rounded-lg transition-all ${mgr.user.isActive ? 'hover:bg-yellow-500/10 text-yellow-500' : 'hover:bg-green-500/10 text-green-500'}`}
                                  title={mgr.user.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBranchManager(branch, mgr)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                                  title="Remove Manager"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && <RoleManagement />}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Subscription Details</h2>

              {subscription ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <PackageIcon className="w-6 h-6 text-neon-blue" />
                      Current Package
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Package Name
                        </label>
                        <p className="text-white text-lg mt-1">{subscription.packageName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Student Limit
                        </label>
                        <p className="text-white text-lg mt-1">{subscription.studentLimit} students</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Price
                        </label>
                        <p className="text-white text-lg mt-1">₹{subscription.pricePerMonth} / month</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </label>
                        <p className="text-white text-lg mt-1 capitalize flex items-center gap-2">
                          {subscription.status === 'active' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                          {subscription.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-neon-purple" />
                      Subscription Period
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Start Date
                        </label>
                        <p className="text-white text-lg mt-1">
                          {new Date(subscription.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          End Date
                        </label>
                        <p className="text-white text-lg mt-1">
                          {new Date(subscription.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </label>
                        <p className="text-white text-lg mt-1 capitalize">
                          {subscription.paymentStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-800 border border-white/10 rounded-xl p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-400">
                    Please contact the super admin to activate a subscription package for your institute.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Institute Settings</h2>
                {!isEditingSettings && (
                  <button
                    onClick={handleEditSettings}
                    className="bg-neon-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Details
                  </button>
                )}
              </div>

              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-neon-purple" />
                  Institute Details
                </h3>

                {isEditingSettings ? (
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Institute Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                          value={settingsFormData.name}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Email (Read Only)
                        </label>
                        <input
                          type="email"
                          disabled
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-gray-500 opacity-60 cursor-not-allowed mt-2"
                          value={institute.email}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                          value={settingsFormData.phone}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Website
                        </label>
                        <input
                          type="url"
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                          value={settingsFormData.website}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Address
                        </label>
                        <textarea
                          rows={3}
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                          value={settingsFormData.address}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, address: e.target.value })}
                          placeholder="Enter full address"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEditSettings}
                        className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Institute Name
                      </label>
                      <p className="text-white mt-1">{institute.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email
                      </label>
                      <p className="text-white mt-1">{institute.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Phone
                      </label>
                      <p className="text-white mt-1">{institute.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Website
                      </label>
                      <p className="text-white mt-1">{institute.website || 'Not provided'}</p>
                    </div>
                    {institute.address && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Address
                        </label>
                        <p className="text-white mt-1">{institute.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">My Profile</h2>
                  <p className="text-gray-400 mt-1">Update your personal information</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      const adminUserStr = localStorage.getItem('instituteAdminUser');
                      const adminUser = adminUserStr ? JSON.parse(adminUserStr) : {};
                      setProfileFormData({
                        firstName: adminUser.firstName || '',
                        lastName: adminUser.lastName || '',
                        phone: adminUser.phone || '',
                      });
                      setIsEditingProfile(true);
                    }}
                    className="bg-neon-purple text-white px-5 py-2.5 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">First Name *</label>
                        <input
                          type="text"
                          required
                          value={profileFormData.firstName}
                          onChange={(e) => setProfileFormData({ ...profileFormData, firstName: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={profileFormData.lastName}
                          onChange={(e) => setProfileFormData({ ...profileFormData, lastName: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  (() => {
                    const u = profileData?.user;
                    const adminUserStr = localStorage.getItem('instituteAdminUser');
                    const adminUser = adminUserStr ? JSON.parse(adminUserStr) : {};
                    const displayUser = u || adminUser;
                    return (
                      <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                            <p className="text-white mt-1 text-lg">{displayUser.firstName || '—'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                            <p className="text-white mt-1 text-lg">{displayUser.lastName || '—'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                            <p className="text-gray-400 mt-1">{displayUser.email || '—'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                            <p className="text-white mt-1">{displayUser.phone || '—'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                            <p className="text-white mt-1">{displayUser.role === 'branch_manager' ? 'Branch Manager' : displayUser.role === 'staff' ? 'Institute Staff' : displayUser.role}</p>
                          </div>
                        </div>

                        {/* Branch Info — only for branch_manager */}
                        {userRole === 'branch_manager' && profileData?.branch && (
                          <div className="border-t border-white/10 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                              <GitBranch className="w-5 h-5 text-neon-blue" />
                              <h3 className="text-white font-bold">My Branch</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</label>
                                <p className="text-white mt-1 text-lg">{profileData.branch.name}</p>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                                <p className="text-white mt-1">{profileData.branch.location || '—'}</p>
                              </div>
                              {profileData.branch.phone && (
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Phone</label>
                                  <p className="text-white mt-1">{profileData.branch.phone}</p>
                                </div>
                              )}
                              {profileData.branch.email && (
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Email</label>
                                  <p className="text-white mt-1">{profileData.branch.email}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${profileData.branch.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                  {profileData.branch.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
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
                      type={showStudentPwd ? 'text' : 'password'}
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowStudentPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showStudentPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

                {userRole !== 'branch_manager' && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Branch
                    </label>
                    <select
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    >
                      <option value="">Headquarter (Default)</option>
                      {branches.map((branch: any) => (
                        <option key={branch.id} value={branch.id}>{branch.name} — {branch.location}</option>
                      ))}
                    </select>
                  </div>
                )}
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
                    type={showAdminNewPwd ? 'text' : 'password'}
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowAdminNewPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showAdminNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    type={showAdminConfirmPwd ? 'text' : 'password'}
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                  <button type="button" onClick={() => setShowAdminConfirmPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showAdminConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-neon-purple" />
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
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
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.firstName}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, firstName: e.target.value })
                      }
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
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.lastName}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, lastName: e.target.value })
                      }
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
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.email}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, email: e.target.value })
                      }
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
                      type={showStaffPwd ? 'text' : 'password'}
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.password}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, password: e.target.value })
                      }
                    />
                    <button type="button" onClick={() => setShowStaffPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showStaffPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role *
                  </label>
                  <select
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="counselor">Counselor</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="support">Support Staff</option>
                  </select>
                </div>

                {userRole !== 'branch_manager' && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Branch
                    </label>
                    <select
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                      value={staffFormData.branchId}
                      onChange={(e) => setStaffFormData({ ...staffFormData, branchId: e.target.value })}
                    >
                      <option value="">Headquarter (Default)</option>
                      {branches.map((branch: any) => (
                        <option key={branch.id} value={branch.id}>{branch.name} — {branch.location}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GitBranch className="w-6 h-6 text-neon-blue" />
                Add New Branch
              </h2>
              <button onClick={() => setShowAddBranchModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={branchFormData.name} onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })} placeholder="e.g. Main Branch, Pune Branch" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                  <input type="text" className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={branchFormData.location} onChange={(e) => setBranchFormData({ ...branchFormData, location: e.target.value })} placeholder="e.g. Pune, Maharashtra" />
                </div>
                <div className="md:col-span-2 pt-2 border-t border-white/10">
                  <p className="text-sm font-bold text-gray-300 mb-3">Branch Manager Details</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={branchFormData.managerFirstName} onChange={(e) => setBranchFormData({ ...branchFormData, managerFirstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={branchFormData.managerLastName} onChange={(e) => setBranchFormData({ ...branchFormData, managerLastName: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manager Email *</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input type="email" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={branchFormData.managerEmail} onChange={(e) => setBranchFormData({ ...branchFormData, managerEmail: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password *</label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input type={showBranchPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={branchFormData.managerPassword} onChange={(e) => setBranchFormData({ ...branchFormData, managerPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowBranchPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showBranchPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input type={showBranchConfirmPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={branchFormData.confirmPassword} onChange={(e) => setBranchFormData({ ...branchFormData, confirmPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowBranchConfirmPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showBranchConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddBranchModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditBranchModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-neon-blue" />
                Edit Branch
              </h2>
              <button onClick={() => setShowEditBranchModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleEditBranch} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name *</label>
                <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                  value={editBranchFormData.name} onChange={(e) => setEditBranchFormData({ ...editBranchFormData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                <input type="text" className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                  value={editBranchFormData.location} onChange={(e) => setEditBranchFormData({ ...editBranchFormData, location: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                  value={editBranchFormData.status} onChange={(e) => setEditBranchFormData({ ...editBranchFormData, status: e.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditBranchModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Manager Password Modal */}
      {showBranchManagerPasswordModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-neon-purple" />
                Change Manager Password
              </h2>
              <button onClick={() => setShowBranchManagerPasswordModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Branch: <span className="text-white font-medium">{selectedBranch?.name}</span>
              {selectedManager && <> · Manager: <span className="text-neon-purple font-medium">{selectedManager.user.firstName} {selectedManager.user.lastName}</span></>}
            </p>
            <form onSubmit={handleBranchManagerPasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showBranchMgrNewPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={branchManagerPasswordData.password} onChange={(e) => setBranchManagerPasswordData({ ...branchManagerPasswordData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowBranchMgrNewPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showBranchMgrNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showBranchMgrConfirmPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={branchManagerPasswordData.confirmPassword} onChange={(e) => setBranchManagerPasswordData({ ...branchManagerPasswordData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowBranchMgrConfirmPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showBranchMgrConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBranchManagerPasswordModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddManagerModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" />
                Add Manager — {selectedBranch.name}
              </h2>
              <button onClick={() => setShowAddManagerModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddManager} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-green-400 outline-none transition-all mt-2"
                    value={addManagerFormData.firstName} onChange={(e) => setAddManagerFormData({ ...addManagerFormData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-green-400 outline-none transition-all mt-2"
                    value={addManagerFormData.lastName} onChange={(e) => setAddManagerFormData({ ...addManagerFormData, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email *</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type="email" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-green-400 outline-none transition-all"
                    value={addManagerFormData.email} onChange={(e) => setAddManagerFormData({ ...addManagerFormData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showAddMgrPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-green-400 outline-none transition-all"
                    value={addManagerFormData.password} onChange={(e) => setAddManagerFormData({ ...addManagerFormData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowAddMgrPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showAddMgrPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showAddMgrConfirmPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-green-400 outline-none transition-all"
                    value={addManagerFormData.confirmPassword} onChange={(e) => setAddManagerFormData({ ...addManagerFormData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowAddMgrConfirmPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showAddMgrConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddManagerModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-all">Add Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-neon-blue" />
                Edit Staff Member
              </h2>
              <button onClick={() => setShowEditStaffModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={editStaffFormData.firstName} onChange={(e) => setEditStaffFormData({ ...editStaffFormData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name *</label>
                  <input type="text" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={editStaffFormData.lastName} onChange={(e) => setEditStaffFormData({ ...editStaffFormData, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email *</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type="email" required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    value={editStaffFormData.email} onChange={(e) => setEditStaffFormData({ ...editStaffFormData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <select className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                  value={editStaffFormData.role} onChange={(e) => setEditStaffFormData({ ...editStaffFormData, role: e.target.value })}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="counselor">Counselor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="support">Support Staff</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditStaffModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Password Modal */}
      {showStaffPasswordModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-neon-purple" />
                Change Staff Password
              </h2>
              <button onClick={() => setShowStaffPasswordModal(false)} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Staff: <span className="text-white font-medium">{selectedStaff.user.firstName} {selectedStaff.user.lastName}</span></p>
            <form onSubmit={handleStaffPasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showStaffNewPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={staffPasswordData.password} onChange={(e) => setStaffPasswordData({ ...staffPasswordData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowStaffNewPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showStaffNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type={showStaffConfirmPwd ? 'text' : 'password'} required className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={staffPasswordData.confirmPassword} onChange={(e) => setStaffPasswordData({ ...staffPasswordData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowStaffConfirmPwd(v => !v)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    {showStaffConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStaffPasswordModal(false)} className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Students Modal */}
      {showStaffStudentsModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-neon-blue" />
                  Students under {selectedStaff.user.firstName} {selectedStaff.user.lastName}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{staffStudents.length} students</p>
              </div>
              <button onClick={() => { setShowStaffStudentsModal(false); setSelectedStaff(null); setStaffStudents([]); }} className="p-2 hover:bg-dark-900 rounded-lg transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {staffStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No students assigned to this staff member</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-900 border-b border-white/10">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {staffStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-dark-900/50">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{student.user.firstName} {student.user.lastName}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{student.user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${student.user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {student.user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

                {/* Daily Trend Last 7 Days */}
                <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Last 7 Days</h3>
                  <div className="space-y-2">
                    {studentStats.dailyTrend.map((day: any) => {
                      const maxVal = Math.max(...studentStats.dailyTrend.map((d: any) => d.applied + d.skipped), 1);
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                            {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <div
                              className="h-2 bg-green-400 rounded-full"
                              style={{ width: `${(day.applied / maxVal) * 100}%`, minWidth: day.applied > 0 ? '4px' : '0' }}
                            />
                            <span className="text-xs text-green-400">{day.applied} applied</span>
                            {day.skipped > 0 && (
                              <>
                                <div
                                  className="h-2 bg-yellow-400 rounded-full"
                                  style={{ width: `${(day.skipped / maxVal) * 100}%`, minWidth: '4px' }}
                                />
                                <span className="text-xs text-yellow-400">{day.skipped} skipped</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
  );
};

export default InstituteAdminDashboard;
