/**
 * ======================== BRANCH MANAGER MODEL ========================
 * Links a User (with role=branch_manager) to a specific branch within an institute
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const BranchManager = sequelize.define('BranchManager', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'branch_id',
    },
    instituteId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'institute_id',
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
    },
    addedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'added_by',
    },
}, {
    tableName: 'branch_managers',
    timestamps: true,
    underscored: true,
});

export default BranchManager;
