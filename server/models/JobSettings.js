/**
 * ======================== JOB SETTINGS MODEL ========================
 * Store all user job profile settings and resume data
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';
import User from './User.js';

const JobSettings = sequelize.define('JobSettings', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    // Naukri Credentials
    naukriEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    naukriPassword: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Job Profile Settings
    targetRole: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Software Engineer',
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Bangalore',
    },
    currentCTC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expectedCTC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    noticePeriod: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Immediate',
    },
    searchKeywords: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Face-to-Face Availability
    availability: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Flexible',
        comment: 'Face-to-face meeting availability',
    },
    // Resume Data
    resumeFileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resumeText: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'Extracted resume text for AI processing',
    },
    resumeScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Experience extracted from resume
    yearsOfExperience: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Scheduling
    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    scheduleStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: true,
    },
    // Timestamps
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'job_settings',
});

// Association
User.hasOne(JobSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
JobSettings.belongsTo(User, { foreignKey: 'userId' });

export default JobSettings;
