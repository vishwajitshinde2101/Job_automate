/**
 * ======================== INSTITUTE BRANCH MODEL ========================
 * Represents branches within an institute
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const InstituteBranch = sequelize.define('InstituteBranch', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    instituteId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'institute_id',
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
}, {
    tableName: 'institute_branches',
    timestamps: true,
    underscored: true,
});

export default InstituteBranch;
