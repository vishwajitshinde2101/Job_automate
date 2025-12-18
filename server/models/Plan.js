/**
 * ======================== PLAN MODEL ========================
 * Subscription plans for the SaaS
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    durationDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'plans',
    timestamps: true,
    underscored: true,
});

export default Plan;
