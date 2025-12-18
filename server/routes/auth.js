/**
 * ======================== AUTH ROUTES ========================
 * User signup, login, and authentication endpoints
 */

import express from 'express';
import User from '../models/User.js';
import JobSettings from '../models/JobSettings.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

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

        const token = generateToken(user.id);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
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

        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
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

export default router;
