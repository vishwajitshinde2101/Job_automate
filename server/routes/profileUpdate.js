/**
 * ======================== PROFILE UPDATE ROUTES ========================
 * API endpoints for Naukri profile auto-update feature
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { queueSafeUpdateResume } from '../services/naukriProfileUpdate.js';
import sequelize from '../db/config.js';
import {
    scheduleProfileUpdateForUser,
    cancelProfileUpdateForUser
} from '../services/schedulerService.js';

const router = express.Router();

/**
 * POST /api/profile-update/naukri/update-resume
 * Update Naukri resume headline (append space to keep profile fresh)
 * Requires authentication
 */
router.post('/naukri/update-resume', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        console.log(`[Profile Update] Request received for userId: ${userId}`);

        // ========== STEP 1: FETCH CREDENTIALS FROM DATABASE ==========
        const [jobSettings] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!jobSettings || jobSettings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job settings not found. Please complete your Job Profile first.',
                status: 'failed'
            });
        }

        const { naukri_email, naukri_password } = jobSettings[0];

        if (!naukri_email || !naukri_password) {
            return res.status(400).json({
                success: false,
                error: 'Naukri credentials not configured. Please add your Naukri email and password in Job Profile settings.',
                status: 'failed'
            });
        }

        console.log(`[Profile Update] Credentials found for: ${naukri_email}`);

        // ========== STEP 2: EXECUTE PUPPETEER UPDATE ==========
        console.log(`[Profile Update] Starting profile update...`);

        const result = await queueSafeUpdateResume(naukri_email, naukri_password);

        console.log(`[Profile Update] Result: ${result.status}`);

        // ========== STEP 3: SAVE LAST UPDATE TIMESTAMP ==========
        if (result.status === 'success') {
            try {
                await sequelize.query(
                    `UPDATE job_settings
                     SET last_profile_update = NOW()
                     WHERE user_id = ?`,
                    { replacements: [userId] }
                );
                console.log(`[Profile Update] Timestamp saved to database`);
            } catch (dbError) {
                console.error(`[Profile Update] Failed to save timestamp:`, dbError.message);
                // Don't fail the request if timestamp save fails
            }
        }

        // ========== STEP 4: RETURN RESPONSE ==========
        return res.json({
            success: result.status === 'success',
            status: result.status,
            message: result.message,
            executedAt: result.executedAt,
            logs: result.logs,
            // Only include screenshot on failure for debugging
            ...(result.status === 'failed' && result.screenshot && {
                screenshot: result.screenshot
            })
        });

    } catch (error) {
        console.error('[Profile Update] API Error:', error);
        return res.status(500).json({
            success: false,
            status: 'failed',
            error: error.message,
            message: 'Profile update failed due to server error'
        });
    }
});

/**
 * GET /api/profile-update/status
 * Get last profile update status and timestamp
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [result] = await sequelize.query(
            `SELECT last_profile_update
             FROM job_settings
             WHERE user_id = ?
             LIMIT 1`,
            { replacements: [userId] }
        );

        if (!result || result.length === 0) {
            return res.json({
                success: true,
                lastUpdate: null,
                message: 'No profile updates yet'
            });
        }

        const lastUpdate = result[0].last_profile_update;

        return res.json({
            success: true,
            lastUpdate: lastUpdate,
            message: lastUpdate ? 'Last update found' : 'No updates yet'
        });

    } catch (error) {
        console.error('[Profile Update Status] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/profile-update/scheduler/configure
 * Enable/configure automatic profile update scheduling
 * Body: { enabled: boolean, frequency: number }
 */
router.post('/scheduler/configure', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { enabled, frequency, scheduleTime } = req.body;

        console.log(`[Profile Update Scheduler] Configure request: enabled=${enabled}, frequency=${frequency}, scheduleTime=${scheduleTime}, userId=${userId}`);

        // ========== VALIDATION ==========
        if (enabled && (!frequency || frequency < 1 || frequency > 30)) {
            return res.status(400).json({
                success: false,
                error: 'Frequency must be between 1 and 30 days'
            });
        }

        // Validate scheduleTime format (HH:MM)
        if (enabled && scheduleTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(scheduleTime)) {
                return res.status(400).json({
                    success: false,
                    error: 'Schedule time must be in HH:MM format (e.g., 09:00, 14:30)'
                });
            }
        }

        // ========== FETCH JOB SETTINGS ==========
        const [jobSettings] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!jobSettings || jobSettings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job settings not found'
            });
        }

        const { naukri_email, naukri_password } = jobSettings[0];

        // ========== CHECK CREDENTIALS ==========
        if (enabled && (!naukri_email || !naukri_password)) {
            return res.status(400).json({
                success: false,
                error: 'Please add Naukri credentials in Job Profile before enabling auto-update'
            });
        }

        // ========== CALCULATE NEXT RUN TIME ==========
        let nextRun = null;
        const timeToUse = scheduleTime || '09:00';

        if (enabled) {
            nextRun = new Date();

            // Set the time based on scheduleTime
            const [hours, minutes] = timeToUse.split(':').map(Number);
            nextRun.setHours(hours, minutes, 0, 0);

            // If the scheduled time has already passed today, schedule for next occurrence
            const now = new Date();
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + frequency);
            }
        }

        // ========== UPDATE DATABASE ==========
        await sequelize.query(
            `UPDATE job_settings
             SET profile_update_enabled = ?,
                 profile_update_frequency = ?,
                 profile_update_schedule_time = ?,
                 profile_update_next_run = ?,
                 profile_update_last_status = ?
             WHERE user_id = ?`,
            {
                replacements: [
                    enabled,
                    frequency || 1,
                    timeToUse + ':00', // Convert HH:MM to HH:MM:SS for TIME column
                    nextRun,
                    enabled ? 'scheduled' : 'idle',
                    userId
                ]
            }
        );

        // ========== SCHEDULE OR CANCEL JOB ==========
        if (enabled) {
            console.log(`[Profile Update Scheduler] Scheduling job for user ${userId}`);
            console.log(`[Profile Update Scheduler] Frequency: Every ${frequency} day(s)`);
            console.log(`[Profile Update Scheduler] Time: ${timeToUse}`);
            console.log(`[Profile Update Scheduler] Next run: ${nextRun.toLocaleString()}`);
            scheduleProfileUpdateForUser(userId, nextRun);
        } else {
            cancelProfileUpdateForUser(userId);
            console.log(`[Profile Update Scheduler] Disabled for user ${userId}`);
        }

        return res.json({
            success: true,
            message: enabled ? 'Auto-update enabled successfully' : 'Auto-update disabled',
            nextRun: nextRun ? nextRun.toISOString() : null,
            frequency
        });

    } catch (error) {
        console.error('[Profile Update Scheduler Configure] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to configure auto-update'
        });
    }
});

/**
 * GET /api/profile-update/scheduler/status
 * Get auto-update scheduler status
 */
router.get('/scheduler/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [result] = await sequelize.query(
            `SELECT profile_update_enabled,
                    profile_update_frequency,
                    profile_update_schedule_time,
                    profile_update_next_run,
                    profile_update_last_status,
                    last_profile_update
             FROM job_settings
             WHERE user_id = ?
             LIMIT 1`,
            { replacements: [userId] }
        );

        if (!result || result.length === 0) {
            return res.json({
                success: true,
                enabled: false,
                frequency: 1,
                scheduleTime: '09:00',
                nextRun: null,
                lastStatus: 'idle',
                lastUpdate: null
            });
        }

        const settings = result[0];

        // Convert TIME to HH:MM format (remove seconds)
        let scheduleTime = '09:00';
        if (settings.profile_update_schedule_time) {
            scheduleTime = settings.profile_update_schedule_time.substring(0, 5);
        }

        return res.json({
            success: true,
            enabled: settings.profile_update_enabled || false,
            frequency: settings.profile_update_frequency || 1,
            scheduleTime: scheduleTime,
            nextRun: settings.profile_update_next_run,
            lastStatus: settings.profile_update_last_status || 'idle',
            lastUpdate: settings.last_profile_update
        });

    } catch (error) {
        console.error('[Profile Update Scheduler Status] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch scheduler status'
        });
    }
});

export default router;
