/**
 * ======================== MODEL ASSOCIATIONS ========================
 * Define all model associations after all models are loaded
 * This file should be imported in server/index.js after model imports
 */

import Institute from './Institute.js';
import Package from './Package.js';
import InstituteSubscription from './InstituteSubscription.js';
import InstituteAdmin from './InstituteAdmin.js';
import InstituteStaff from './InstituteStaff.js';
import InstituteStudent from './InstituteStudent.js';
import User from './User.js';
import InstituteRole from './InstituteRole.js';
import InstitutePermission from './InstitutePermission.js';
import InstituteRolePermission from './InstituteRolePermission.js';
import InstituteBranch from './InstituteBranch.js';
import BranchManager from './BranchManager.js';

// Institute -> InstituteSubscription (one-to-many)
Institute.hasMany(InstituteSubscription, {
    foreignKey: 'instituteId',
    as: 'subscriptions',
});
InstituteSubscription.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// Package -> InstituteSubscription (one-to-many)
Package.hasMany(InstituteSubscription, {
    foreignKey: 'packageId',
    as: 'subscriptions',
});
InstituteSubscription.belongsTo(Package, {
    foreignKey: 'packageId',
    as: 'package',
});

// Institute -> InstituteAdmin (one-to-many)
Institute.hasMany(InstituteAdmin, {
    foreignKey: 'instituteId',
    as: 'admins',
});
InstituteAdmin.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteAdmin (one-to-many)
User.hasMany(InstituteAdmin, {
    foreignKey: 'userId',
    as: 'instituteAdminRoles',
});
InstituteAdmin.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Institute -> InstituteStaff (one-to-many)
Institute.hasMany(InstituteStaff, {
    foreignKey: 'instituteId',
    as: 'staff',
});
InstituteStaff.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteStaff (one-to-many)
User.hasMany(InstituteStaff, {
    foreignKey: 'userId',
    as: 'instituteStaffRoles',
});
InstituteStaff.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Institute -> InstituteStudent (one-to-many)
Institute.hasMany(InstituteStudent, {
    foreignKey: 'instituteId',
    as: 'students',
});
InstituteStudent.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// User -> InstituteStudent (one-to-many)
User.hasMany(InstituteStudent, {
    foreignKey: 'userId',
    as: 'instituteStudentRoles',
});
InstituteStudent.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// User (added_by) -> InstituteStaff (one-to-many)
User.hasMany(InstituteStaff, {
    foreignKey: 'addedBy',
    as: 'addedStaff',
});
InstituteStaff.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'admin',
});

// User (added_by) -> InstituteStudent (one-to-many)
User.hasMany(InstituteStudent, {
    foreignKey: 'addedBy',
    as: 'addedStudents',
});
InstituteStudent.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'admin',
});

// ============================================================================
// RBAC ASSOCIATIONS
// ============================================================================

// Institute -> InstituteRole (one-to-many)
Institute.hasMany(InstituteRole, {
    foreignKey: 'instituteId',
    as: 'roles',
});
InstituteRole.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// InstituteRole -> InstituteRolePermission (one-to-many)
InstituteRole.hasMany(InstituteRolePermission, {
    foreignKey: 'roleId',
    as: 'rolePermissions',
});
InstituteRolePermission.belongsTo(InstituteRole, {
    foreignKey: 'roleId',
    as: 'role',
});

// InstitutePermission -> InstituteRolePermission (one-to-many)
InstitutePermission.hasMany(InstituteRolePermission, {
    foreignKey: 'permissionId',
    as: 'rolePermissions',
});
InstituteRolePermission.belongsTo(InstitutePermission, {
    foreignKey: 'permissionId',
    as: 'permission',
});

// Many-to-Many: InstituteRole <-> InstitutePermission through InstituteRolePermission
InstituteRole.belongsToMany(InstitutePermission, {
    through: InstituteRolePermission,
    foreignKey: 'roleId',
    otherKey: 'permissionId',
    as: 'permissions',
});
InstitutePermission.belongsToMany(InstituteRole, {
    through: InstituteRolePermission,
    foreignKey: 'permissionId',
    otherKey: 'roleId',
    as: 'roles',
});

// InstituteStaff -> InstituteRole (many-to-one)
InstituteStaff.belongsTo(InstituteRole, {
    foreignKey: 'roleId',
    as: 'instituteRole',
});
InstituteRole.hasMany(InstituteStaff, {
    foreignKey: 'roleId',
    as: 'staffMembers',
});

// InstituteStudent -> InstituteRole (many-to-one)
InstituteStudent.belongsTo(InstituteRole, {
    foreignKey: 'roleId',
    as: 'instituteRole',
});
InstituteRole.hasMany(InstituteStudent, {
    foreignKey: 'roleId',
    as: 'students',
});

// InstituteStudent -> InstituteBranch (many-to-one)
InstituteStudent.belongsTo(InstituteBranch, {
    foreignKey: 'branchId',
    as: 'branch',
});
InstituteBranch.hasMany(InstituteStudent, {
    foreignKey: 'branchId',
    as: 'branchStudents',
});

// InstituteStaff -> InstituteBranch (many-to-one)
InstituteStaff.belongsTo(InstituteBranch, {
    foreignKey: 'branchId',
    as: 'branch',
});
InstituteBranch.hasMany(InstituteStaff, {
    foreignKey: 'branchId',
    as: 'branchStaff',
});

// ============================================================================
// BRANCH ASSOCIATIONS
// ============================================================================

// Institute -> InstituteBranch (one-to-many)
Institute.hasMany(InstituteBranch, {
    foreignKey: 'instituteId',
    as: 'branches',
});
InstituteBranch.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

// InstituteBranch -> BranchManager (one-to-one/one-to-many)
InstituteBranch.hasMany(BranchManager, {
    foreignKey: 'branchId',
    as: 'managers',
});
BranchManager.belongsTo(InstituteBranch, {
    foreignKey: 'branchId',
    as: 'branch',
});

// User -> BranchManager
User.hasMany(BranchManager, {
    foreignKey: 'userId',
    as: 'branchManagerRoles',
});
BranchManager.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// User (addedBy) -> BranchManager
User.hasMany(BranchManager, {
    foreignKey: 'addedBy',
    as: 'addedBranchManagers',
});
BranchManager.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'addedByAdmin',
});

// Institute -> BranchManager
Institute.hasMany(BranchManager, {
    foreignKey: 'instituteId',
    as: 'branchManagers',
});
BranchManager.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute',
});

console.log('✅ Model associations defined');

export default {
    Institute,
    Package,
    InstituteSubscription,
    InstituteAdmin,
    InstituteStaff,
    InstituteStudent,
    User,
    InstituteRole,
    InstitutePermission,
    InstituteRolePermission,
    InstituteBranch,
    BranchManager,
};
