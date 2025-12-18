/**
 * ======================== SUBSCRIPTION API ========================
 * Frontend API functions for subscription management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = `${API_BASE_URL}/subscription`;

/**
 * Get auth headers
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
}

/**
 * Get all available plans
 */
export async function getPlans() {
    try {
        const response = await fetch(`${API_BASE}/plans`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
    } catch (error) {
        console.error('Get plans error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get single plan by ID
 */
export async function getPlanById(planId) {
    try {
        const response = await fetch(`${API_BASE}/plan/${planId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
    } catch (error) {
        console.error('Get plan error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create Razorpay order
 */
export async function createOrder(planId) {
    try {
        const response = await fetch(`${API_BASE}/create-order`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ planId }),
        });
        return await response.json();
    } catch (error) {
        console.error('Create order error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify payment
 */
export async function verifyPayment(paymentData) {
    try {
        const response = await fetch(`${API_BASE}/verify-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData),
        });
        return await response.json();
    } catch (error) {
        console.error('Verify payment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await response.json();
    } catch (error) {
        console.error('Get subscription status error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory() {
    try {
        const response = await fetch(`${API_BASE}/history`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await response.json();
    } catch (error) {
        console.error('Get subscription history error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Initialize Razorpay payment
 */
export async function initiatePayment(orderData, userInfo, onSuccess, onFailure) {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        onFailure({ error: 'Failed to load Razorpay SDK' });
        return;
    }

    const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'JobAutoApply',
        description: orderData.planName || 'Subscription Plan',
        order_id: orderData.orderId,
        handler: async function (response) {
            // Payment successful - verify on backend
            const verifyResult = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });

            if (verifyResult.success) {
                onSuccess(verifyResult);
            } else {
                onFailure(verifyResult);
            }
        },
        prefill: {
            name: userInfo?.name || '',
            email: userInfo?.email || '',
            contact: userInfo?.phone || '',
        },
        notes: {
            planName: orderData.planName,
        },
        theme: {
            color: '#6366f1',
        },
        modal: {
            ondismiss: function () {
                onFailure({ error: 'Payment cancelled by user' });
            },
        },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
        onFailure({
            error: response.error.description,
            code: response.error.code,
        });
    });
    razorpay.open();
}

export default {
    getPlans,
    getPlanById,
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    getSubscriptionHistory,
    loadRazorpayScript,
    initiatePayment,
};
