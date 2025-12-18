
import schedule from 'node-schedule';
import JobSettings from '../models/JobSettings.js';
import { startAutomation } from '../autoApply.js';
import User from '../models/User.js';
import { setUserAnswersData } from '../aiAnswer.js';

// Track active jobs to avoiding duplicates
const activeJobs = new Map();

/**
 * Run the automation task for a user
 * @param {string} userId
 */
async function runScheduledTask(userId) {
    console.log(`⏰ Executing scheduled task for user ${userId}`);

    try {
        const jobSettings = await JobSettings.findOne({ where: { userId } });
        if (!jobSettings) {
            console.error(`❌ Job settings not found for user ${userId}`);
            return;
        }

        // Update status to processing (optional, or just keep pending until done)

        // Load data needed for automation
        const user = await User.findByPk(userId);

        setUserAnswersData({
            name: user?.firstName || 'User',
            currentCTC: jobSettings.currentCTC,
            expectedCTC: jobSettings.expectedCTC,
            noticePeriod: jobSettings.noticePeriod,
            location: jobSettings.location,
            yearsOfExperience: jobSettings.yearsOfExperience,
            naukriEmail: jobSettings.naukriEmail,
        });

        // Run automation
        const result = await startAutomation({
            userId: userId,
            jobUrl: 'https://www.naukri.com/jobs-by-skill-software-engineer', // Default or fetch from settings if added
            maxPages: 5,
            resumeText: jobSettings.resumeText,
            naukriEmail: jobSettings.naukriEmail,
            naukriPassword: jobSettings.naukriPassword,
        });

        // Update status
        await jobSettings.update({
            scheduleStatus: result.success ? 'completed' : 'failed',
            // scheduledTime: null // Optional: clear schedule or keep history
        });

        console.log(`✅ Scheduled task completed for user ${userId}: ${result.success ? 'Success' : 'Failed'}`);

    } catch (error) {
        console.error(`❌ Error executing scheduled task for user ${userId}:`, error);
        // Update status to failed
        await JobSettings.update(
            { scheduleStatus: 'failed' },
            { where: { userId } }
        );
    } finally {
        activeJobs.delete(userId);
    }
}

/**
 * Schedule a job for a specific time
 * @param {string} userId
 * @param {Date} date
 */
export function scheduleJobForUser(userId, date) {
    // Cancel existing job if any
    if (activeJobs.has(userId)) {
        activeJobs.get(userId).cancel();
    }

    const job = schedule.scheduleJob(date, () => runScheduledTask(userId));
    activeJobs.set(userId, job);

    console.log(`📅 Job scheduled for user ${userId} at ${date.toLocaleString()}`);
}

/**
 * Cancel a scheduled job
 * @param {string} userId
 */
export function cancelScheduledJob(userId) {
    if (activeJobs.has(userId)) {
        activeJobs.get(userId).cancel();
        activeJobs.delete(userId);
        return true;
    }
    return false;
}

/**
 * Initialize scheduler: Load pending jobs from DB on startup
 */
export async function initScheduler() {
    console.log('🔄 Initializing scheduler...');
    try {
        const pendingJobs = await JobSettings.findAll({
            where: {
                scheduleStatus: 'pending',
            }
        });

        let count = 0;
        const now = new Date();

        for (const job of pendingJobs) {
            if (job.scheduledTime) {
                const scheduleTime = new Date(job.scheduledTime);

                // If time is in the past, run immediately or mark failed?
                // Let's run immediately if it was missed recently (e.g. within last hour), else skip?
                // For simplicity, let's schedule it. If it's past, node-schedule might run it immediately or we handle it.

                if (scheduleTime < now) {
                    console.log(`⚠️ Missed schedule for user ${job.userId} at ${scheduleTime.toLocaleString()}. Running immediately.`);
                    runScheduledTask(job.userId);
                } else {
                    scheduleJobForUser(job.userId, scheduleTime);
                }
                count++;
            }
        }

        console.log(`✅ Scheduler initialized. Loaded ${count} pending jobs.`);
    } catch (error) {
        console.error('❌ Failed to initialize scheduler:', error);
    }
}
