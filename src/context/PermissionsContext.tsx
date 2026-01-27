/**
 * ======================== PERMISSIONS CONTEXT ========================
 * Provides user permissions throughout the application
 * Used for role-based feature visibility and access control
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PermissionsContextType {
    permissions: string[];
    role: string | null;
    hasFullAccess: boolean;
    loading: boolean;
    hasPermission: (permission: string | string[]) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
    children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [hasFullAccess, setHasFullAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        try {
            // Check for both regular token and institute admin token
            let token = localStorage.getItem('token');
            let userRole = localStorage.getItem('userRole');

            console.log('🔐 PermissionsContext: Checking credentials...', { token: token ? 'exists' : 'missing', userRole });

            // If not found, check for institute admin credentials
            if (!token) {
                token = localStorage.getItem('instituteAdminToken');
                const userStr = localStorage.getItem('instituteAdminUser');
                console.log('🔐 Checking instituteAdmin credentials...', { token: token ? 'exists' : 'missing', userStr: userStr ? 'exists' : 'missing' });

                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        userRole = user.role; // 'institute_admin' or 'staff'
                        console.log('✅ Parsed user role:', userRole);
                    } catch (e) {
                        console.error('❌ Error parsing instituteAdminUser:', e);
                    }
                }
            }

            // Only fetch permissions for institute users
            if (!token || !['institute_admin', 'staff'].includes(userRole || '')) {
                console.log('⚠️ No valid credentials found. Token:', !!token, 'Role:', userRole);
                setPermissions([]);
                setRole(null);
                setHasFullAccess(false);
                setLoading(false);
                return;
            }

            console.log('📡 Fetching permissions for role:', userRole);
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
            const response = await fetch(`${API_BASE_URL}/rbac/my-permissions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('❌ API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch permissions');
            }

            const data = await response.json();
            console.log('✅ Permissions response:', data);

            if (data.success) {
                setPermissions(data.permissions || []);
                setRole(data.role);
                setHasFullAccess(data.hasFullAccess || false);
                console.log('✅ Permissions set:', {
                    permissionsCount: data.permissions?.length || 0,
                    role: data.role,
                    hasFullAccess: data.hasFullAccess
                });
            }
        } catch (error) {
            console.error('❌ Error fetching permissions:', error);
            setPermissions([]);
            setRole(null);
            setHasFullAccess(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    // Check if user has a specific permission or all permissions in an array
    const hasPermission = (permission: string | string[]): boolean => {
        // Admins have full access
        if (hasFullAccess) return true;

        if (Array.isArray(permission)) {
            // Check if user has ALL permissions in the array
            return permission.every(p => permissions.includes(p));
        }

        // Check single permission
        return permissions.includes(permission);
    };

    // Check if user has ANY of the permissions in an array
    const hasAnyPermission = (perms: string[]): boolean => {
        // Admins have full access
        if (hasFullAccess) return true;

        return perms.some(p => permissions.includes(p));
    };

    const refreshPermissions = async () => {
        setLoading(true);
        await fetchPermissions();
    };

    const value: PermissionsContextType = {
        permissions,
        role,
        hasFullAccess,
        loading,
        hasPermission,
        hasAnyPermission,
        refreshPermissions,
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

// Custom hook to use permissions
export const usePermissions = (): PermissionsContextType => {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
};

// HOC to protect components based on permissions
interface WithPermissionProps {
    permission: string | string[];
    fallback?: ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps & { children: ReactNode }> = ({
    permission,
    fallback = null,
    children,
}) => {
    const { hasPermission, loading } = usePermissions();

    if (loading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
