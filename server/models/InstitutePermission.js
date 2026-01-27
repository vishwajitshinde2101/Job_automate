/**
 * ======================== INSTITUTE PERMISSION MODEL ========================
 * Stores all available permissions/features
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const InstitutePermission = sequelize.define('InstitutePermission', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    permissionKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'permission_key',
    },
    permissionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'permission_name',
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'institute_permissions',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstitutePermission;
