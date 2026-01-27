/**
 * ======================== INSTITUTE ROLE MODEL ========================
 * Manages custom roles per institute (Admin, Teacher, HR, etc.)
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import Institute from './Institute.js';

const InstituteRole = sequelize.define('InstituteRole', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    instituteId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'institute_id',
        references: {
            model: Institute,
            key: 'id',
        },
    },
    roleName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'role_name',
    },
    roleKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'role_key',
        // Unique per institute handled by database constraint
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
    },
    isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_system',
    },
}, {
    tableName: 'institute_roles',
    timestamps: true,
    underscored: true,
});

// Note: Associations are defined in models/associations.js

export default InstituteRole;
