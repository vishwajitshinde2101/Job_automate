/**
 * ======================== INSTITUTE AUTHENTICATION MIDDLEWARE ========================
 * Middleware to verify user has institute admin or staff role
 */

import InstituteAdmin from '../models/InstituteAdmin.js';
import InstituteStaff from '../models/InstituteStaff.js';
import Institute from '../models/Institute.js';

/**
 * Middleware to check if user is institute admin or staff
 * Adds instituteId and institute to req object
 */
export const isInstituteAdminOrStaff = async (req, res, next) => {
    try {
        if (req.userRole !== 'institute_admin' && req.userRole !== 'staff') {
            return res.status(403).json({ error: 'Access denied. Institute admin or staff only.' });
        }

        // Get institute ID based on role
        let instituteId;
        let institute;

        if (req.userRole === 'institute_admin') {
            const admin = await InstituteAdmin.findOne({
                where: { userId: req.userId },
                include: [{ model: Institute, as: 'institute' }],
            });

            if (!admin) {
                return res.status(404).json({ error: 'Institute admin not found' });
            }

            instituteId = admin.instituteId;
            institute = admin.institute;
        } else if (req.userRole === 'staff') {
            const staff = await InstituteStaff.findOne({
                where: { userId: req.userId },
                include: [{ model: Institute, as: 'institute' }],
            });

            if (!staff) {
                return res.status(404).json({ error: 'Institute staff not found' });
            }

            instituteId = staff.instituteId;
            institute = staff.institute;
        }

        req.instituteId = instituteId;
        req.institute = institute;
        next();
    } catch (error) {
        console.error('Error in isInstituteAdminOrStaff middleware:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Middleware to check if user is institute admin ONLY (for admin-only actions)
 * Adds instituteId and institute to req object
 */
export const isInstituteAdminOnly = async (req, res, next) => {
    try {
        if (req.userRole !== 'institute_admin') {
            return res.status(403).json({ error: 'Access denied. Institute admin only.' });
        }

        // Get admin's institute
        const admin = await InstituteAdmin.findOne({
            where: { userId: req.userId },
            include: [{ model: Institute, as: 'institute' }],
        });

        if (!admin) {
            return res.status(404).json({ error: 'Institute admin not found' });
        }

        req.instituteId = admin.instituteId;
        req.institute = admin.institute;
        next();
    } catch (error) {
        console.error('Error in isInstituteAdminOnly middleware:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
