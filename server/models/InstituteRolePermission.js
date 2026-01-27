/**
 * ======================== INSTITUTE ROLE PERMISSION MODEL ========================
 * Junction table mapping roles to permissions
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import InstituteRole from './InstituteRole.js';
import InstitutePermission from './InstitutePermission.js';

const InstituteRolePermission = sequelize.define('InstituteRolePermission', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    roleId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'role_id',
        references: {
            model: InstituteRole,
            key: 'id',
        },
    },
    permissionId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'permission_id',
        references: {
            model: InstitutePermission,
            key: 'id',
        },
    },
}, {
    tableName: 'institute_role_permissions',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Only created_at
});

// Note: Associations are defined in models/associations.js

export default InstituteRolePermission;
