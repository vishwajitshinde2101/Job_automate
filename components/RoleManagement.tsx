/**
 * ======================== ROLE MANAGEMENT COMPONENT ========================
 * Allows Institute Admins to create, edit, and manage roles with permissions
 * Staff members can view roles (read-only)
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { usePermissions } from '../src/context/PermissionsContext';

interface Permission {
    id: number;
    permissionKey: string;
    permissionName: string;
    module: string;
    description: string;
}

interface Role {
    id: number;
    roleName: string;
    roleKey: string;
    description: string;
    isActive: boolean;
    isSystem: boolean;
    permissions: Permission[];
}

interface GroupedPermissions {
    [module: string]: Permission[];
}

const RoleManagement: React.FC = () => {
    const { hasPermission, hasFullAccess, permissions, role, loading: permissionsLoading } = usePermissions();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        roleName: '',
        roleKey: '',
        description: '',
        selectedPermissions: [] as number[],
    });

    // Expanded modules in permission selector
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['dashboard', 'students']));

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
    const canManageRoles = hasFullAccess || hasPermission('roles.manage');

    // Debug logging
    useEffect(() => {
        console.log('🔍 RoleManagement Debug:', {
            hasFullAccess,
            canManageRoles,
            role,
            permissionsCount: permissions.length,
            permissionsLoading,
            token: localStorage.getItem('instituteAdminToken') ? 'exists' : 'missing'
        });
    }, [hasFullAccess, canManageRoles, permissions, permissionsLoading]);

    useEffect(() => {
        fetchRoles();
        if (canManageRoles) {
            fetchPermissions();
        }
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('instituteAdminToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rbac/roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setRoles(data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('instituteAdminToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rbac/permissions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setAllPermissions(data.permissions);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleCreateRole = () => {
        setFormData({
            roleName: '',
            roleKey: '',
            description: '',
            selectedPermissions: [],
        });
        setEditingRole(null);
        setShowCreateModal(true);
    };

    const handleEditRole = (role: Role) => {
        setFormData({
            roleName: role.roleName,
            roleKey: role.roleKey,
            description: role.description,
            selectedPermissions: role.permissions.map(p => p.id),
        });
        setEditingRole(role);
        setShowCreateModal(true);
    };

    const handleSaveRole = async () => {
        try {
            const token = localStorage.getItem('instituteAdminToken') || localStorage.getItem('token');
            const url = editingRole
                ? `${API_BASE_URL}/rbac/roles/${editingRole.id}`
                : `${API_BASE_URL}/rbac/roles`;

            const method = editingRole ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roleName: formData.roleName,
                    roleKey: formData.roleKey.toLowerCase(),
                    description: formData.description,
                    permissionIds: formData.selectedPermissions,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(editingRole ? 'Role updated successfully' : 'Role created successfully');
                setShowCreateModal(false);
                fetchRoles();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to save role');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Error saving role:', error);
            setError('Failed to save role');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteRole = async (roleId: number) => {
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('instituteAdminToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rbac/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Role deleted successfully');
                fetchRoles();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to delete role');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            setError('Failed to delete role');
            setTimeout(() => setError(''), 3000);
        }
    };

    const togglePermission = (permissionId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedPermissions: prev.selectedPermissions.includes(permissionId)
                ? prev.selectedPermissions.filter(id => id !== permissionId)
                : [...prev.selectedPermissions, permissionId],
        }));
    };

    const toggleModule = (module: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(module)) {
                newSet.delete(module);
            } else {
                newSet.add(module);
            }
            return newSet;
        });
    };

    const selectAllInModule = (module: string) => {
        const modulePermissions = allPermissions[module] || [];
        const modulePermissionIds = modulePermissions.map(p => p.id);
        const allSelected = modulePermissionIds.every(id => formData.selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all
            setFormData(prev => ({
                ...prev,
                selectedPermissions: prev.selectedPermissions.filter(id => !modulePermissionIds.includes(id)),
            }));
        } else {
            // Select all
            setFormData(prev => ({
                ...prev,
                selectedPermissions: [...new Set([...prev.selectedPermissions, ...modulePermissionIds])],
            }));
        }
    };

    if (loading || permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading roles...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-600" />
                        Role Management
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Manage roles and permissions for your institute staff
                    </p>
                </div>

                {canManageRoles && (
                    <button
                        onClick={handleCreateRole}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Role
                    </button>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map(role => (
                    <div
                        key={role.id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    {role.roleName}
                                    {role.isSystem && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                            System
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                            </div>

                            {canManageRoles && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditRole(role)}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit role"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {!role.isSystem && (
                                        <button
                                            onClick={() => handleDeleteRole(role.id)}
                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                                Permissions ({role.permissions.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 5).map(perm => (
                                    <span
                                        key={perm.id}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                        {perm.permissionName}
                                    </span>
                                ))}
                                {role.permissions.length > 5 && (
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                        +{role.permissions.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No roles created yet</p>
                    {canManageRoles && (
                        <button
                            onClick={handleCreateRole}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create Your First Role
                        </button>
                    )}
                </div>
            )}

            {/* Create/Edit Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Role Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.roleName}
                                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                        placeholder="e.g., Teacher, Counselor, HR Manager"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Key * (lowercase, no spaces)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.roleKey}
                                        onChange={(e) => setFormData({ ...formData, roleKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        placeholder="e.g., teacher, counselor, hr_manager"
                                        disabled={editingRole?.isSystem}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what this role can do..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Permissions Selection */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Permissions ({formData.selectedPermissions.length} selected)
                                </h4>

                                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                                    {Object.entries(allPermissions).map(([module, permissions]) => {
                                        const isExpanded = expandedModules.has(module);
                                        const modulePermissionIds = permissions.map(p => p.id);
                                        const allSelected = modulePermissionIds.every(id => formData.selectedPermissions.includes(id));
                                        const someSelected = modulePermissionIds.some(id => formData.selectedPermissions.includes(id)) && !allSelected;

                                        return (
                                            <div key={module} className="bg-white">
                                                <div className="flex items-center gap-3 p-4">
                                                    <button
                                                        onClick={() => toggleModule(module)}
                                                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </button>

                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(input) => {
                                                            if (input) {
                                                                input.indeterminate = someSelected;
                                                            }
                                                        }}
                                                        onChange={() => selectAllInModule(module)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />

                                                    <div className="flex-1">
                                                        <button
                                                            onClick={() => toggleModule(module)}
                                                            className="text-left w-full"
                                                        >
                                                            <span className="font-medium text-gray-900 capitalize">
                                                                {module}
                                                            </span>
                                                            <span className="ml-2 text-sm text-gray-500">
                                                                ({permissions.length} permissions)
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pl-14 space-y-2">
                                                        {permissions.map(permission => (
                                                            <label
                                                                key={permission.id}
                                                                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.selectedPermissions.includes(permission.id)}
                                                                    onChange={() => togglePermission(permission.id)}
                                                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-sm text-gray-900">
                                                                        {permission.permissionName}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {permission.description}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRole}
                                disabled={!formData.roleName || !formData.roleKey || formData.selectedPermissions.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
