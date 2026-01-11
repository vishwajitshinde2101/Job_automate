/**
 * ======================== SUPER ADMIN ROUTES ========================
 * Routes for super admin to manage institutes, packages, and subscriptions
 */

import express from 'express';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';
import Institute from '../models/Institute.js';
import Package from '../models/Package.js';
import InstituteSubscription from '../models/InstituteSubscription.js';
import InstituteAdmin from '../models/InstituteAdmin.js';
import InstituteStudent from '../models/InstituteStudent.js';
import InstituteStaff from '../models/InstituteStaff.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to check if user is super admin
const isSuperAdmin = (req, res, next) => {
    if (req.userRole !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied. Super admin only.' });
    }
    next();
};

// ============================================================================
// PACKAGE MANAGEMENT
// ============================================================================

/**
 * GET /api/superadmin/packages
 * Get all packages
 */
router.get('/packages', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const packages = await Package.findAll({
            order: [['pricePerMonth', 'ASC']],
        });
        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

/**
 * POST /api/superadmin/packages
 * Create new package
 */
router.post('/packages', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { name, description, studentLimit, pricePerMonth, features } = req.body;

        const package_ = await Package.create({
            name,
            description,
            studentLimit,
            pricePerMonth,
            features,
            isActive: true,
        });

        res.status(201).json({ message: 'Package created successfully', package: package_ });
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ error: 'Failed to create package' });
    }
});

/**
 * PUT /api/superadmin/packages/:id
 * Update package
 */
router.put('/packages/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, studentLimit, pricePerMonth, features, isActive } = req.body;

        const package_ = await Package.findByPk(id);
        if (!package_) {
            return res.status(404).json({ error: 'Package not found' });
        }

        await package_.update({
            name,
            description,
            studentLimit,
            pricePerMonth,
            features,
            isActive,
        });

        res.json({ message: 'Package updated successfully', package: package_ });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ error: 'Failed to update package' });
    }
});

/**
 * DELETE /api/superadmin/packages/:id
 * Delete package (only if no active subscriptions)
 */
router.delete('/packages/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if package has active subscriptions
        const activeSubscriptions = await InstituteSubscription.count({
            where: { packageId: id, status: 'active' },
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                error: 'Cannot delete package with active subscriptions',
            });
        }

        await Package.destroy({ where: { id } });
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ error: 'Failed to delete package' });
    }
});

// ============================================================================
// INSTITUTE MANAGEMENT
// ============================================================================

/**
 * GET /api/superadmin/institutes
 * Get all institutes with subscription details
 */
router.get('/institutes', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const institutes = await Institute.findAll({
            include: [
                {
                    model: InstituteSubscription,
                    as: 'subscriptions',
                    include: [{ model: Package, as: 'package' }],
                    order: [['createdAt', 'DESC']],
                    limit: 1,
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        // Get student count for each institute
        const institutesWithCounts = await Promise.all(
            institutes.map(async (institute) => {
                const studentCount = await InstituteStudent.count({
                    where: { instituteId: institute.id },
                });

                const adminCount = await InstituteAdmin.count({
                    where: { instituteId: institute.id },
                });

                const staffCount = await InstituteStaff.count({
                    where: { instituteId: institute.id },
                });

                return {
                    ...institute.toJSON(),
                    studentCount,
                    adminCount,
                    staffCount,
                };
            })
        );

        res.json(institutesWithCounts);
    } catch (error) {
        console.error('Error fetching institutes:', error);
        res.status(500).json({ error: 'Failed to fetch institutes' });
    }
});

/**
 * POST /api/superadmin/institutes
 * Create new institute with admin user
 */
router.post('/institutes', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            website,
            adminName,
            adminEmail,
            adminPassword,
        } = req.body;

        // Check if institute email already exists
        const existingInstitute = await Institute.findOne({ where: { email } });
        if (existingInstitute) {
            return res.status(400).json({ error: 'Institute email already exists' });
        }

        // Check if admin email already exists
        const existingUser = await User.findOne({ where: { email: adminEmail } });
        if (existingUser) {
            return res.status(400).json({ error: 'Admin email already exists' });
        }

        // Create institute
        const instituteId = uuidv4();
        const institute = await Institute.create({
            id: instituteId,
            name,
            email,
            phone,
            address,
            website,
            status: 'active',
            createdBy: req.userId,
        });

        // Create admin user
        // Note: Password will be automatically hashed by User model's beforeCreate hook
        // Split adminName into firstName and lastName
        const nameParts = adminName.trim().split(' ');
        const firstName = nameParts[0] || adminName;
        const lastName = nameParts.slice(1).join(' ') || '';

        const adminUser = await User.create({
            id: uuidv4(),
            firstName: firstName,
            lastName: lastName,
            email: adminEmail,
            password: adminPassword, // Will be hashed by beforeCreate hook
            role: 'institute_admin',
            instituteId: instituteId,
            isActive: true, // Active immediately when created by Super Admin
        });

        // Link admin to institute
        await InstituteAdmin.create({
            instituteId: instituteId,
            userId: adminUser.id,
        });

        res.status(201).json({
            message: 'Institute created successfully',
            institute,
            admin: {
                id: adminUser.id,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
            },
        });
    } catch (error) {
        console.error('Error creating institute:', error);
        res.status(500).json({ error: 'Failed to create institute', details: error.message });
    }
});

/**
 * PUT /api/superadmin/institutes/:id
 * Update institute details
 */
router.put('/institutes/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, website, status } = req.body;

        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        await institute.update({
            name,
            email,
            phone,
            address,
            website,
            status,
        });

        res.json({ message: 'Institute updated successfully', institute });
    } catch (error) {
        console.error('Error updating institute:', error);
        res.status(500).json({ error: 'Failed to update institute' });
    }
});

/**
 * DELETE /api/superadmin/institutes/:id
 * Delete institute (cascades to admins, staff, students)
 */
router.delete('/institutes/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        await institute.destroy();
        res.json({ message: 'Institute deleted successfully' });
    } catch (error) {
        console.error('Error deleting institute:', error);
        res.status(500).json({ error: 'Failed to delete institute' });
    }
});

/**
 * POST /api/superadmin/institutes/:id/approve
 * Approve pending institute registration
 */
router.post('/institutes/:id/approve', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        if (institute.status !== 'inactive') {
            return res.status(400).json({ error: 'Institute is not pending approval' });
        }

        // Update institute status to active
        await institute.update({ status: 'active' });

        // Activate all admin users for this institute
        await User.update(
            { isActive: true },
            {
                where: {
                    instituteId: id,
                    role: 'institute_admin',
                },
            }
        );

        console.log(`✅ Institute "${institute.name}" approved by Super Admin`);

        res.json({
            message: 'Institute approved successfully',
            institute: {
                id: institute.id,
                name: institute.name,
                status: institute.status,
            },
        });
    } catch (error) {
        console.error('Error approving institute:', error);
        res.status(500).json({ error: 'Failed to approve institute', details: error.message });
    }
});

/**
 * POST /api/superadmin/institutes/:id/reject
 * Reject pending institute registration
 */
router.post('/institutes/:id/reject', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        if (institute.status !== 'inactive') {
            return res.status(400).json({ error: 'Institute is not pending approval' });
        }

        // Update institute status to suspended
        await institute.update({
            status: 'suspended',
            rejectionReason: reason || 'Application rejected by administrator',
        });

        console.log(`❌ Institute "${institute.name}" rejected by Super Admin. Reason: ${reason}`);

        res.json({
            message: 'Institute registration rejected',
            institute: {
                id: institute.id,
                name: institute.name,
                status: institute.status,
            },
        });
    } catch (error) {
        console.error('Error rejecting institute:', error);
        res.status(500).json({ error: 'Failed to reject institute', details: error.message });
    }
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * POST /api/superadmin/subscriptions
 * Create subscription for institute
 */
router.post('/subscriptions', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { instituteId, packageId, startDate, endDate, paymentStatus } = req.body;

        const subscription = await InstituteSubscription.create({
            instituteId,
            packageId,
            startDate,
            endDate,
            status: paymentStatus === 'paid' ? 'active' : 'pending',
            paymentStatus,
        });

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

/**
 * PUT /api/superadmin/subscriptions/:id/payment
 * Update payment status
 */
router.put('/subscriptions/:id/payment', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentDate, paymentAmount, paymentReference } = req.body;

        const subscription = await InstituteSubscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await subscription.update({
            paymentStatus,
            paymentDate,
            paymentAmount,
            paymentReference,
            status: paymentStatus === 'paid' ? 'active' : subscription.status,
        });

        res.json({ message: 'Payment updated successfully', subscription });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

/**
 * GET /api/superadmin/dashboard-stats
 * Get dashboard statistics
 */
router.get('/dashboard-stats', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const totalInstitutes = await Institute.count();
        const activeInstitutes = await Institute.count({ where: { status: 'active' } });
        const totalStudents = await InstituteStudent.count();
        const totalAdmins = await InstituteAdmin.count();
        const totalStaff = await InstituteStaff.count();

        const activeSubscriptions = await InstituteSubscription.count({
            where: { status: 'active', paymentStatus: 'paid' },
        });

        const pendingPayments = await InstituteSubscription.count({
            where: { paymentStatus: 'pending' },
        });

        // Calculate total revenue
        const subscriptions = await InstituteSubscription.findAll({
            where: { paymentStatus: 'paid' },
            attributes: ['paymentAmount'],
        });

        const totalRevenue = subscriptions.reduce(
            (sum, sub) => sum + parseFloat(sub.paymentAmount || 0),
            0
        );

        res.json({
            totalInstitutes,
            activeInstitutes,
            totalStudents,
            totalAdmins,
            totalStaff,
            activeSubscriptions,
            pendingPayments,
            totalRevenue,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * GET /api/superadmin/users
 * Get all users with filters
 */
router.get('/users', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { role, instituteId, search } = req.query;

        // Build where clause
        const where = {};
        if (role) {
            where.role = role;
        }
        if (instituteId) {
            where.instituteId = instituteId;
        }
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const users = await User.findAll({
            where,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'instituteId', 'createdAt', 'onboardingCompleted'],
            order: [['createdAt', 'DESC']],
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ============================================================================
// INVOICE GENERATION
// ============================================================================

/**
 * GET /api/superadmin/institutes/:id/invoice
 * Generate and download invoice PDF for institute
 */
router.get('/institutes/:id/invoice', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Get institute details
        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        // Get latest subscription
        const subscription = await InstituteSubscription.findOne({
            where: { instituteId: id },
            include: [{ model: Package, as: 'package' }],
            order: [['createdAt', 'DESC']],
        });

        if (!subscription) {
            return res.status(404).json({ error: 'No subscription found for this institute' });
        }

        // Dynamically import PDFDocument
        const PDFDocument = (await import('pdfkit')).default;

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=AutoJobzy_Invoice_${institute.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        );

        // Pipe PDF to response
        doc.pipe(res);

        // Invoice Header - Company Branding
        doc.fontSize(24)
            .fillColor('#00F3FF')
            .text('AutoJobzy', 50, 50);

        doc.fontSize(10)
            .fillColor('#666666')
            .text('Automated Job Application Platform', 50, 80)
            .text('Email: support@autojobzy.com', 50, 95)
            .text('Website: www.autojobzy.com', 50, 110);

        // Invoice Title
        doc.fontSize(20)
            .fillColor('#000000')
            .text('INVOICE', 400, 50, { align: 'right' });

        // Invoice Number and Date
        const invoiceNumber = `INV-${String(subscription.id).padStart(6, '0')}`;
        const invoiceDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        doc.fontSize(10)
            .fillColor('#666666')
            .text(`Invoice No: ${invoiceNumber}`, 400, 80, { align: 'right' })
            .text(`Date: ${invoiceDate}`, 400, 95, { align: 'right' });

        // Line separator
        doc.moveTo(50, 140)
            .lineTo(550, 140)
            .stroke('#CCCCCC');

        // Bill To Section
        doc.fontSize(12)
            .fillColor('#000000')
            .text('BILL TO:', 50, 160);

        doc.fontSize(11)
            .fillColor('#333333')
            .text(institute.name, 50, 180)
            .text(institute.email, 50, 195);

        if (institute.phone) {
            doc.text(`Phone: ${institute.phone}`, 50, 210);
        }

        if (institute.address) {
            doc.text(institute.address, 50, 225, { width: 250 });
        }

        // Package Details Section
        const tableTop = 300;
        doc.fontSize(12)
            .fillColor('#000000')
            .text('SUBSCRIPTION DETAILS:', 50, tableTop - 20);

        // Table Header
        const headerY = tableTop;
        doc.rect(50, headerY, 500, 25)
            .fillAndStroke('#00F3FF', '#00F3FF');

        doc.fontSize(10)
            .fillColor('#000000')
            .text('Description', 60, headerY + 8)
            .text('Duration', 300, headerY + 8)
            .text('Amount', 450, headerY + 8);

        // Table Row
        const rowY = headerY + 25;
        doc.rect(50, rowY, 500, 30)
            .stroke('#CCCCCC');

        doc.fontSize(10)
            .fillColor('#333333')
            .text(subscription.package.name, 60, rowY + 8, { width: 220 })
            .text(
                `${new Date(subscription.startDate).toLocaleDateString('en-IN')} - ${new Date(subscription.endDate).toLocaleDateString('en-IN')}`,
                300,
                rowY + 8,
                { width: 130 }
            )
            .text(`₹${subscription.paymentAmount || subscription.package.pricePerMonth}`, 450, rowY + 8, { align: 'right', width: 90 });

        // Subtotal and Total Section
        const subtotalY = rowY + 60;

        doc.fontSize(10)
            .fillColor('#666666')
            .text('Subtotal:', 350, subtotalY)
            .text(`₹${subscription.paymentAmount || subscription.package.pricePerMonth}`, 450, subtotalY, { align: 'right', width: 90 });

        doc.text('Tax (0%):', 350, subtotalY + 20)
            .text('₹0', 450, subtotalY + 20, { align: 'right', width: 90 });

        // Total
        doc.fontSize(12)
            .fillColor('#000000')
            .text('Total:', 350, subtotalY + 45)
            .text(`₹${subscription.paymentAmount || subscription.package.pricePerMonth}`, 450, subtotalY + 45, { align: 'right', width: 90 });

        // Payment Status
        const paymentStatusY = subtotalY + 80;
        const statusColor = subscription.paymentStatus === 'paid' ? '#10B981' : '#F59E0B';
        const statusText = subscription.paymentStatus.toUpperCase();

        doc.fontSize(10)
            .fillColor(statusColor)
            .text(`Payment Status: ${statusText}`, 50, paymentStatusY);

        if (subscription.paymentDate) {
            doc.fillColor('#666666')
                .text(`Payment Date: ${new Date(subscription.paymentDate).toLocaleDateString('en-IN')}`, 50, paymentStatusY + 20);
        }

        // Footer
        const footerY = 700;
        doc.moveTo(50, footerY)
            .lineTo(550, footerY)
            .stroke('#CCCCCC');

        doc.fontSize(8)
            .fillColor('#999999')
            .text('Thank you for your business!', 50, footerY + 10)
            .text('For any queries, contact us at support@autojobzy.com', 50, footerY + 25)
            .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 40);

        // Finalize PDF
        doc.end();

        console.log(`✅ Invoice generated for institute: ${institute.name}`);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

// ============================================================================
// INSTITUTE MEMBERS MANAGEMENT
// ============================================================================

/**
 * GET /api/superadmin/institutes/:id/students
 * Get all students for a specific institute
 */
router.get('/institutes/:id/students', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify institute exists
        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        // Fetch all students for this institute
        const students = await InstituteStudent.findAll({
            where: { instituteId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * GET /api/superadmin/institutes/:id/admins
 * Get all admins for a specific institute
 */
router.get('/institutes/:id/admins', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify institute exists
        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        // Fetch all admins for this institute
        const admins = await InstituteAdmin.findAll({
            where: { instituteId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

/**
 * GET /api/superadmin/institutes/:id/staff
 * Get all staff for a specific institute
 */
router.get('/institutes/:id/staff', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify institute exists
        const institute = await Institute.findByPk(id);
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        // Fetch all staff for this institute
        const staff = await InstituteStaff.findAll({
            where: { instituteId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * PUT /api/superadmin/users/:id/toggle-active
 * Toggle user active status (activate/deactivate)
 */
router.put('/users/:id/toggle-active', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Find user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deactivating super admins
        if (user.role === 'superadmin' && isActive === false) {
            return res.status(403).json({ error: 'Cannot deactivate super admin accounts' });
        }

        // Update user status
        await user.update({ isActive });

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

export default router;
