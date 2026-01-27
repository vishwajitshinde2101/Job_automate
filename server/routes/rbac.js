/**
 * ======================== RBAC ROUTES ========================
 * Role-Based Access Control Management APIs
 * Handles roles, permissions, and permission assignment
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { isInstituteAdminOnly, isInstituteAdminOrStaff } from '../middleware/instituteAuth.js';
import InstituteRole from '../models/InstituteRole.js';
import InstitutePermission from '../models/InstitutePermission.js';
import InstituteRolePermission from '../models/InstituteRolePermission.js';
import InstituteStaff from '../models/InstituteStaff.js';
import InstituteStudent from '../models/InstituteStudent.js';
import User from '../models/User.js';

const router = express.Router();

// ============================================================================
// PERMISSIONS MANAGEMENT
// ============================================================================

/**
 * GET /api/rbac/permissions
 * Get all available permissions grouped by module
 * Admin only
 */
router.get('/permissions', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const permissions = await InstitutePermission.findAll({
            order: [['module', 'ASC'], ['permissionKey', 'ASC']],
        });

        // Group by module
        const groupedPermissions = permissions.reduce((acc, perm) => {
            const module = perm.module;
            if (!acc[module]) {
                acc[module] = [];
            }
            acc[module].push(perm);
            return acc;
        }, {});

        res.json({
            success: true,
            permissions: groupedPermissions,
            totalPermissions: permissions.length,
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// ============================================================================
// ROLES MANAGEMENT
// ============================================================================

/**
 * GET /api/rbac/roles
 * Get all roles for the institute with their permissions
 * Admin and Staff can view
 */
router.get('/roles', authenticateToken, isInstituteAdminOrStaff, async (req, res) => {
    try {
        const roles = await InstituteRole.findAll({
            where: { instituteId: req.instituteId },
            include: [
                {
                    model: InstitutePermission,
                    as: 'permissions',
                    through: { attributes: [] }, // Exclude junction table attributes
                },
            ],
            order: [['isSystem', 'DESC'], ['roleName', 'ASC']],
        });

        res.json({
            success: true,
            roles,
            totalRoles: roles.length,
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

/**
 * GET /api/rbac/roles/:roleId
 * Get specific role details with permissions
 * Admin only
 */
router.get('/roles/:roleId', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await InstituteRole.findOne({
            where: {
                id: roleId,
                instituteId: req.instituteId,
            },
            include: [
                {
                    model: InstitutePermission,
                    as: 'permissions',
                    through: { attributes: [] },
                },
            ],
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json({
            success: true,
            role,
        });
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({ error: 'Failed to fetch role details' });
    }
});

/**
 * POST /api/rbac/roles
 * Create a new custom role
 * Admin only
 */
router.post('/roles', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const { roleName, roleKey, description, permissionIds } = req.body;

        // Validate required fields
        if (!roleName || !roleKey) {
            return res.status(400).json({ error: 'Role name and key are required' });
        }

        // Check if role key already exists for this institute
        const existingRole = await InstituteRole.findOne({
            where: {
                instituteId: req.instituteId,
                roleKey,
            },
        });

        if (existingRole) {
            return res.status(400).json({ error: 'Role with this key already exists' });
        }

        // Create role
        const role = await InstituteRole.create({
            instituteId: req.instituteId,
            roleName,
            roleKey: roleKey.toLowerCase(),
            description,
            isSystem: false,
            isActive: true,
        });

        // Assign permissions if provided
        if (permissionIds && permissionIds.length > 0) {
            const rolePermissions = permissionIds.map(permissionId => ({
                roleId: role.id,
                permissionId,
            }));

            await InstituteRolePermission.bulkCreate(rolePermissions);
        }

        // Fetch role with permissions
        const roleWithPermissions = await InstituteRole.findByPk(role.id, {
            include: [
                {
                    model: InstitutePermission,
                    as: 'permissions',
                    through: { attributes: [] },
                },
            ],
        });

        console.log(`✅ Role created: ${roleName} by admin ${req.userId}`);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            role: roleWithPermissions,
        });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role', details: error.message });
    }
});

/**
 * PUT /api/rbac/roles/:roleId
 * Update role details and permissions
 * Admin only
 */
router.put('/roles/:roleId', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const { roleId } = req.params;
        const { roleName, description, permissionIds, isActive } = req.body;

        const role = await InstituteRole.findOne({
            where: {
                id: roleId,
                instituteId: req.instituteId,
            },
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Cannot modify system roles' key or delete them
        if (role.isSystem && roleKey) {
            return res.status(403).json({ error: 'Cannot modify system role key' });
        }

        // Update role basic info
        await role.update({
            roleName: roleName || role.roleName,
            description: description !== undefined ? description : role.description,
            isActive: isActive !== undefined ? isActive : role.isActive,
        });

        // Update permissions if provided
        if (permissionIds !== undefined) {
            // Remove existing permissions
            await InstituteRolePermission.destroy({
                where: { roleId: role.id },
            });

            // Add new permissions
            if (permissionIds.length > 0) {
                const rolePermissions = permissionIds.map(permissionId => ({
                    roleId: role.id,
                    permissionId,
                }));

                await InstituteRolePermission.bulkCreate(rolePermissions);
            }
        }

        // Fetch updated role with permissions
        const updatedRole = await InstituteRole.findByPk(role.id, {
            include: [
                {
                    model: InstitutePermission,
                    as: 'permissions',
                    through: { attributes: [] },
                },
            ],
        });

        console.log(`✅ Role updated: ${role.roleName} by admin ${req.userId}`);

        res.json({
            success: true,
            message: 'Role updated successfully',
            role: updatedRole,
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * DELETE /api/rbac/roles/:roleId
 * Delete a custom role
 * Admin only
 * Cannot delete system roles
 */
router.delete('/roles/:roleId', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await InstituteRole.findOne({
            where: {
                id: roleId,
                instituteId: req.instituteId,
            },
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Cannot delete system roles
        if (role.isSystem) {
            return res.status(403).json({ error: 'Cannot delete system role' });
        }

        // Check if role is assigned to any users
        const staffCount = await InstituteStaff.count({
            where: { roleId: role.id },
        });
        const studentCount = await InstituteStudent.count({
            where: { roleId: role.id },
        });

        if (staffCount > 0 || studentCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete role that is assigned to users',
                staffCount,
                studentCount,
            });
        }

        await role.destroy();

        console.log(`✅ Role deleted: ${role.roleName} by admin ${req.userId}`);

        res.json({
            success: true,
            message: 'Role deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

// ============================================================================
// USER PERMISSIONS
// ============================================================================

/**
 * GET /api/rbac/my-permissions
 * Get current user's permissions based on their role
 * Returns array of permission keys
 */
router.get('/my-permissions', authenticateToken, isInstituteAdminOrStaff, async (req, res) => {
    try {
        let roleId = null;

        // Check if user is staff or student
        if (req.userRole === 'staff') {
            const staff = await InstituteStaff.findOne({
                where: {
                    userId: req.userId,
                    instituteId: req.instituteId,
                },
            });
            roleId = staff?.roleId;
        } else if (req.userRole === 'student') {
            const student = await InstituteStudent.findOne({
                where: {
                    userId: req.userId,
                    instituteId: req.instituteId,
                },
            });
            roleId = student?.roleId;
        } else if (req.userRole === 'institute_admin') {
            // Admin has all permissions
            const allPermissions = await InstitutePermission.findAll({
                attributes: ['permissionKey'],
            });

            return res.json({
                success: true,
                permissions: allPermissions.map(p => p.permissionKey),
                role: 'admin',
                hasFullAccess: true,
            });
        }

        if (!roleId) {
            // No role assigned, return empty permissions
            return res.json({
                success: true,
                permissions: [],
                role: null,
                hasFullAccess: false,
            });
        }

        // Fetch role with permissions
        const role = await InstituteRole.findByPk(roleId, {
            include: [
                {
                    model: InstitutePermission,
                    as: 'permissions',
                    attributes: ['permissionKey', 'permissionName', 'module'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!role) {
            return res.json({
                success: true,
                permissions: [],
                role: null,
                hasFullAccess: false,
            });
        }

        const permissionKeys = role.permissions.map(p => p.permissionKey);

        res.json({
            success: true,
            permissions: permissionKeys,
            role: role.roleName,
            roleKey: role.roleKey,
            hasFullAccess: false,
            permissionsDetails: role.permissions,
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
});

// ============================================================================
// ROLE ASSIGNMENT
// ============================================================================

/**
 * POST /api/rbac/assign-role
 * Assign a role to a staff member or student
 * Admin only
 */
router.post('/assign-role', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        const { userId, roleId, userType } = req.body;

        // Validate required fields
        if (!userId || !roleId || !userType) {
            return res.status(400).json({ error: 'userId, roleId, and userType are required' });
        }

        if (!['staff', 'student'].includes(userType)) {
            return res.status(400).json({ error: 'userType must be "staff" or "student"' });
        }

        // Verify role belongs to this institute
        const role = await InstituteRole.findOne({
            where: {
                id: roleId,
                instituteId: req.instituteId,
            },
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Assign role based on user type
        if (userType === 'staff') {
            const staff = await InstituteStaff.findOne({
                where: {
                    userId,
                    instituteId: req.instituteId,
                },
            });

            if (!staff) {
                return res.status(404).json({ error: 'Staff member not found' });
            }

            await staff.update({ roleId });

            console.log(`✅ Role "${role.roleName}" assigned to staff ${userId}`);

        } else if (userType === 'student') {
            const student = await InstituteStudent.findOne({
                where: {
                    userId,
                    instituteId: req.instituteId,
                },
            });

            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            await student.update({ roleId });

            console.log(`✅ Role "${role.roleName}" assigned to student ${userId}`);
        }

        res.json({
            success: true,
            message: 'Role assigned successfully',
            role: role.roleName,
        });
    } catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
});

/**
 * POST /api/rbac/initialize-default-roles
 * Initialize default roles for an institute
 * Called automatically when institute is created or manually by admin
 */
router.post('/initialize-default-roles', authenticateToken, isInstituteAdminOnly, async (req, res) => {
    try {
        // Check if roles already exist
        const existingRoles = await InstituteRole.count({
            where: { instituteId: req.instituteId },
        });

        if (existingRoles > 0) {
            return res.status(400).json({ error: 'Roles already initialized for this institute' });
        }

        // Get all permissions
        const permissions = await InstitutePermission.findAll();

        // Define default roles with their permissions
        const defaultRoles = [
            {
                roleName: 'Teacher',
                roleKey: 'teacher',
                description: 'Can manage students and attendance',
                isSystem: true,
                permissions: [
                    'dashboard.view',
                    'students.view', 'students.add', 'students.edit', 'students.password',
                    'attendance.view', 'attendance.mark', 'attendance.edit',
                    'reports.view', 'reports.student',
                ],
            },
            {
                roleName: 'HR Manager',
                roleKey: 'hr',
                description: 'Manages staff and generates reports',
                isSystem: true,
                permissions: [
                    'dashboard.view', 'dashboard.analytics',
                    'staff.view', 'staff.add', 'staff.edit',
                    'students.view', 'students.export',
                    'reports.view', 'reports.staff', 'reports.student',
                ],
            },
            {
                roleName: 'Trainer',
                roleKey: 'trainer',
                description: 'Marks attendance and views reports',
                isSystem: true,
                permissions: [
                    'dashboard.view',
                    'students.view',
                    'attendance.view', 'attendance.mark',
                    'reports.view', 'reports.student',
                ],
            },
            {
                roleName: 'Support Staff',
                roleKey: 'support',
                description: 'View-only access to students and attendance',
                isSystem: true,
                permissions: [
                    'dashboard.view',
                    'students.view',
                    'attendance.view',
                ],
            },
        ];

        // Create roles
        const createdRoles = [];
        for (const roleData of defaultRoles) {
            const role = await InstituteRole.create({
                instituteId: req.instituteId,
                roleName: roleData.roleName,
                roleKey: roleData.roleKey,
                description: roleData.description,
                isSystem: roleData.isSystem,
                isActive: true,
            });

            // Assign permissions
            const permissionIds = permissions
                .filter(p => roleData.permissions.includes(p.permissionKey))
                .map(p => p.id);

            if (permissionIds.length > 0) {
                const rolePermissions = permissionIds.map(permissionId => ({
                    roleId: role.id,
                    permissionId,
                }));

                await InstituteRolePermission.bulkCreate(rolePermissions);
            }

            createdRoles.push(role);
        }

        console.log(`✅ Initialized ${createdRoles.length} default roles for institute ${req.instituteId}`);

        res.json({
            success: true,
            message: 'Default roles initialized successfully',
            roles: createdRoles,
        });
    } catch (error) {
        console.error('Error initializing default roles:', error);
        res.status(500).json({ error: 'Failed to initialize default roles' });
    }
});

export default router;
