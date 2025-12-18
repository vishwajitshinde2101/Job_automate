/**
 * ======================== USER FILTER MODEL ========================
 * Store user's selected job search filters
 * Links to job_settings or users table
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const UserFilter = sequelize.define('UserFilter', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    // Filter selections stored as comma-separated values for multiselect
    freshness: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    salaryRange: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    wfhType: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    citiesGid: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    functionalAreaGid: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    industryTypeGid: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ugCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pgCourseGid: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    business_size: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    employement: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    glbl_RoleCat: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    topGroupId: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    featuredCompanies: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Final URL after filters applied on Naukri
    finalUrl: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
}, {
    tableName: 'user_filters',
    indexes: [
        {
            unique: true,
            fields: ['user_id'],
        },
    ],
});

// Association
User.hasOne(UserFilter, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserFilter.belongsTo(User, { foreignKey: 'userId' });

export default UserFilter;
