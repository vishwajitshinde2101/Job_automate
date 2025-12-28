/**
 * ======================== AUTH ROUTES ========================
 * User signup, login, and authentication endpoints
 */

import express from 'express';
import User from '../models/User.js';
import JobSettings from '../models/JobSettings.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { verifyNaukriCredentials } from '../verifyNaukriCredentials.js';
import * as razorpayService from '../services/razorpayService.js';
import * as subscriptionService from '../services/subscriptionService.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            firstName: firstName || email.split('@')[0],
            lastName: lastName || '',
        });

        // Create default job settings
        await JobSettings.create({
            userId: user.id,
        });

        const token = generateToken(user.id, user.role);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

/**
 * POST /api/auth/signup-with-payment
 * Create user account after successful payment (signup flow)
 * Called after payment is completed during signup
 */
router.post('/signup-with-payment', async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            planId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        console.log('[Signup with Payment] Request received:', {
            email,
            firstName,
            lastName,
            planId,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            console.log('[Signup with Payment] Missing user details');
            return res.status(400).json({
                success: false,
                error: 'User details are required',
            });
        }

        if (!planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.log('[Signup with Payment] Missing payment details');
            return res.status(400).json({
                success: false,
                error: 'Payment details are required',
            });
        }

        // Verify payment signature
        console.log('[Signup with Payment] Verifying payment signature');
        const isValid = razorpayService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.log('[Signup with Payment] Invalid payment signature');
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed',
            });
        }

        console.log('[Signup with Payment] Payment verified successfully');

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('[Signup with Payment] User already exists');
            return res.status(409).json({
                success: false,
                error: 'User already exists with this email',
            });
        }

        // Create user account
        console.log('[Signup with Payment] Creating user account');
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
        });

        console.log('[Signup with Payment] User created:', user.id);

        // Create default job settings
        await JobSettings.create({
            userId: user.id,
        });

        // Create and activate subscription for new user
        console.log('[Signup with Payment] Creating subscription for new user');

        // Get plan details to calculate end date
        const plan = await subscriptionService.getPlanById(planId);
        if (!plan) {
            throw new Error('Plan not found');
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);

        // Create subscription directly as active (since payment already verified)
        const subscription = await subscriptionService.createSubscription(
            user.id,
            planId,
            razorpay_order_id,
            parseFloat(plan.price)
        );

        // Update subscription to active with payment details
        await subscription.update({
            razorpay_payment_id: razorpay_payment_id,
            razorpay_signature: razorpay_signature,
            startDate: startDate,
            endDate: endDate,
            status: 'active',
        });

        console.log('[Signup with Payment] Subscription created and activated:', {
            subscriptionId: subscription.id,
            status: subscription.status,
        });

        // Generate auth token
        const token = generateToken(user.id, user.role);

        console.log('[Signup with Payment] Account created and activated successfully');

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
            },
            subscription: {
                id: subscription.id,
                planId: subscription.planId,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
            },
        });
    } catch (error) {
        console.error('[Signup with Payment] Error occurred:', error);
        console.error('[Signup with Payment] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create account',
        });
    }
});

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/profile
 * Get current user profile (protected)
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        const jobSettings = await JobSettings.findOne({ where: { userId: req.userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            jobSettings,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (frontend clears token)
 */
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

/**
 * POST /api/auth/complete-onboarding
 * Mark user's onboarding as completed
 */
router.post('/complete-onboarding', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.onboardingCompleted = true;
        await user.save();

        res.json({
            success: true,
            message: 'Onboarding completed successfully',
            onboardingCompleted: true
        });
    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(500).json({ error: 'Failed to complete onboarding' });
    }
});

/**
 * POST /api/auth/verify-naukri-credentials
 * Verify Naukri account credentials by attempting login
 * SECURITY: Only performs login check - no data scraping or job actions
 */
router.post('/verify-naukri-credentials', authenticateToken, async (req, res) => {
    try {
        const { naukriUsername, naukriPassword } = req.body;

        // Validate inputs
        if (!naukriUsername || !naukriPassword) {
            return res.status(400).json({
                success: false,
                error: 'Naukri username and password are required'
            });
        }

        console.log(`[API] Verifying Naukri credentials for user ${req.userId}...`);

        // Call verification function (credentials are NOT logged)
        const result = await verifyNaukriCredentials(naukriUsername, naukriPassword);

        // Update user's job settings with verification status if successful
        if (result.success) {
            const jobSettings = await JobSettings.findOne({ where: { userId: req.userId } });
            if (jobSettings) {
                jobSettings.credentialsVerified = true;
                jobSettings.lastVerified = new Date();
                await jobSettings.save();
                console.log(`[API] ✓ Credentials verified and saved for user ${req.userId}`);
            }
        }

        // Return verification result
        res.json({
            success: result.success,
            message: result.message,
            verified: result.success
        });

    } catch (error) {
        console.error('[API] Credential verification error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Verification failed due to a server error. Please try again later.'
        });
    }
});

export default router;
