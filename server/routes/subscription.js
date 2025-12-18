/**
 * ======================== SUBSCRIPTION ROUTES ========================
 * API endpoints for subscription and payment management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as razorpayService from '../services/razorpayService.js';
import * as subscriptionService from '../services/subscriptionService.js';

const router = express.Router();

/**
 * GET /api/subscription/plans
 * Get all active plans with features
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await subscriptionService.getAllPlans();
        res.json({
            success: true,
            data: plans,
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/subscription/plan/:planId
 * Get single plan by ID
 */
router.get('/plan/:planId', async (req, res) => {
    try {
        const plan = await subscriptionService.getPlanById(req.params.planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found',
            });
        }
        res.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/subscription/create-order
 * Create Razorpay order for a plan
 * Requires authentication
 */
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.userId;

        if (!planId) {
            return res.status(400).json({
                success: false,
                error: 'Plan ID is required',
            });
        }

        // Get plan details
        const plan = await subscriptionService.getPlanById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found',
            });
        }

        if (!plan.isActive) {
            return res.status(400).json({
                success: false,
                error: 'This plan is no longer available',
            });
        }

        // Create Razorpay order
        const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`;
        const order = await razorpayService.createOrder(
            parseFloat(plan.price),
            'INR',
            receipt,
            {
                userId,
                planId,
                planName: plan.name,
            }
        );

        // Create pending subscription record
        await subscriptionService.createSubscription(
            userId,
            planId,
            order.id,
            parseFloat(plan.price)
        );

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: razorpayService.getKeyId(),
                planName: plan.name,
                planDescription: plan.description,
            },
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/subscription/verify-payment
 * Verify Razorpay payment and activate subscription
 * Requires authentication
 */
router.post('/verify-payment', authenticateToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment details',
            });
        }

        // Verify signature
        const isValid = razorpayService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            // Mark subscription as failed
            await subscriptionService.failSubscription(razorpay_order_id);
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed',
            });
        }

        // Activate subscription
        const subscription = await subscriptionService.activateSubscription(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                subscriptionId: subscription.id,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status,
            },
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 * Requires authentication
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const subscription = await subscriptionService.getActiveSubscription(userId);

        if (!subscription) {
            return res.json({
                success: true,
                data: {
                    hasActiveSubscription: false,
                    subscription: null,
                },
            });
        }

        res.json({
            success: true,
            data: {
                hasActiveSubscription: true,
                subscription: {
                    id: subscription.id,
                    planId: subscription.planId,
                    planName: subscription.plan?.name,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    status: subscription.status,
                    features: subscription.plan?.features || [],
                    daysRemaining: Math.ceil(
                        (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                    ),
                },
            },
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/subscription/history
 * Get user's subscription history
 * Requires authentication
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const subscriptions = await subscriptionService.getSubscriptionHistory(userId);

        res.json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        console.error('Get subscription history error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/subscription/webhook
 * Razorpay webhook handler
 * No authentication - uses webhook signature verification
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        const crypto = await import('crypto');
        const expectedSignature = crypto.default
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = JSON.parse(req.body.toString());
        const { event: eventType, payload } = event;

        console.log('Razorpay webhook received:', eventType);

        switch (eventType) {
            case 'payment.captured':
                // Payment successful - subscription should already be activated via verify-payment
                console.log('Payment captured:', payload.payment.entity.id);
                break;

            case 'payment.failed':
                // Payment failed
                const orderId = payload.payment.entity.order_id;
                await subscriptionService.failSubscription(orderId);
                console.log('Payment failed:', orderId);
                break;

            default:
                console.log('Unhandled webhook event:', eventType);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
