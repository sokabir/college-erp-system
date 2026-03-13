# Razorpay Integration Guide for Fee Payment System

This guide explains how to integrate Razorpay payment gateway into your ERP system for processing student fee payments.

## Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **API Keys**: Get your Test/Live API keys from Razorpay Dashboard
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret

## Step 1: Install Razorpay SDK

### Backend (Node.js)
```bash
cd backend
npm install razorpay
```

### Frontend (React)
No installation needed - we'll use Razorpay's checkout script via CDN

## Step 2: Configure Environment Variables

Add to `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

Add to `frontend/.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

## Step 3: Database Schema Updates

Add payment tracking columns to the `fees` table:

```sql
ALTER TABLE fees 
ADD COLUMN razorpay_order_id VARCHAR(100) NULL,
ADD COLUMN razorpay_payment_id VARCHAR(100) NULL,
ADD COLUMN razorpay_signature VARCHAR(255) NULL,
ADD COLUMN payment_method VARCHAR(50) NULL,
ADD COLUMN payment_date TIMESTAMP NULL;
```

## Step 4: Backend Implementation

### Create Razorpay Instance (`backend/config/razorpay.js`)

```javascript
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpayInstance;
```

### Update Student Controller (`backend/controllers/studentController.js`)

Add these new functions:

```javascript
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay order for fee payment
// @route   POST /api/student/fees/:id/create-order
// @access  Private
const createFeeOrder = async (req, res) => {
    try {
        const feeId = req.params.id;
        
        // Get student info
        const [studentRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        // Get fee details
        const [feeRows] = await db.query(
            'SELECT * FROM fees WHERE id = ? AND student_id = ? AND status = "PENDING"',
            [feeId, studentRows[0].id]
        );
        
        if (feeRows.length === 0) {
            return res.status(404).json({ message: 'Fee record not found or already paid' });
        }
        
        const fee = feeRows[0];
        
        // Create Razorpay order
        const options = {
            amount: Math.round(parseFloat(fee.amount_due) * 100), // Amount in paise
            currency: 'INR',
            receipt: `fee_${feeId}_${Date.now()}`,
            notes: {
                fee_id: feeId,
                student_id: studentRows[0].id,
                description: `Fee payment for ${fee.fee_type || 'Course Fee'}`
            }
        };
        
        const order = await razorpay.orders.create(options);
        
        // Save order ID to database
        await db.query(
            'UPDATE fees SET razorpay_order_id = ? WHERE id = ?',
            [order.id, feeId]
        );
        
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
        
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// @desc    Verify Razorpay payment and update fee status
// @route   POST /api/student/fees/:id/verify-payment
// @access  Private
const verifyFeePayment = async (req, res) => {
    try {
        const feeId = req.params.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        
        // Get payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        // Update fee record
        await db.query(
            `UPDATE fees 
             SET status = 'PAID',
                 razorpay_payment_id = ?,
                 razorpay_signature = ?,
                 payment_method = ?,
                 payment_date = NOW()
             WHERE id = ? AND razorpay_order_id = ?`,
            [razorpay_payment_id, razorpay_signature, payment.method, feeId, razorpay_order_id]
        );
        
        res.json({ 
            message: 'Payment verified successfully',
            payment_id: razorpay_payment_id
        });
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

// Export these new functions
module.exports = {
    // ... existing exports
    createFeeOrder,
    verifyFeePayment
};
```

### Update Student Routes (`backend/routes/studentRoutes.js`)

Add these routes:

```javascript
router.post('/fees/:id/create-order', createFeeOrder);
router.post('/fees/:id/verify-payment', verifyFeePayment);
```

## Step 5: Frontend Implementation

### Update Student Fees Page (`frontend/src/pages/Student/Fees.jsx`)

```javascript
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StudentFees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchFees = async () => {
        try {
            const res = await api.get('/student/fees');
            setFees(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
        
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async (feeId, amount) => {
        setProcessing(true);
        
        try {
            // Step 1: Create Razorpay order
            const orderRes = await api.post(`/student/fees/${feeId}/create-order`);
            const { order_id, amount: orderAmount, currency, key_id } = orderRes.data;
            
            // Step 2: Open Razorpay checkout
            const options = {
                key: key_id,
                amount: orderAmount,
                currency: currency,
                name: 'College ERP System',
                description: 'Fee Payment',
                order_id: order_id,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        await api.post(`/student/fees/${feeId}/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        alert('Payment successful!');
                        fetchFees(); // Refresh fee list
                    } catch (error) {
                        alert('Payment verification failed. Please contact admin.');
                        console.error('Verification error:', error);
                    }
                },
                prefill: {
                    name: '', // Can be filled from student profile
                    email: '', // Can be filled from student profile
                    contact: '' // Can be filled from student profile
                },
                theme: {
                    color: '#3b82f6'
                },
                modal: {
                    ondismiss: function() {
                        setProcessing(false);
                    }
                }
            };
            
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            
        } catch (error) {
            alert('Failed to initiate payment');
            console.error('Payment error:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading fees...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={28} /> Fee Management
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Track and pay your course fees securely.
                </p>
            </div>

            {fees.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                    <div style={{ color: 'var(--text-muted)' }}>No fee records found.</div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Fee Type</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fees.map(fee => (
                                <tr key={fee.id}>
                                    <td style={{ fontWeight: 500 }}>
                                        {fee.fee_type || 'Course Fee'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} color="#6b7280" />
                                            {new Date(fee.due_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                        ₹{parseFloat(fee.amount_due).toLocaleString('en-IN')}
                                    </td>
                                    <td>
                                        {fee.status === 'PAID' ? (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                backgroundColor: '#dcfce7',
                                                color: '#16a34a',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                <CheckCircle size={14} /> Paid
                                            </span>
                                        ) : (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                <AlertCircle size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {fee.payment_date ? (
                                            new Date(fee.payment_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {fee.status !== 'PAID' && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handlePayment(fee.id, fee.amount_due)}
                                                disabled={processing}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    opacity: processing ? 0.6 : 1
                                                }}
                                            >
                                                <CreditCard size={16} />
                                                {processing ? 'Processing...' : 'Pay Now'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentFees;
```

## Step 6: Testing

### Test Mode
1. Use test API keys (starting with `rzp_test_`)
2. Use Razorpay test cards:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4111 1111 1111 1112
   - CVV: Any 3 digits
   - Expiry: Any future date

### Test Payment Flow
1. Login as student
2. Navigate to Fees section
3. Click "Pay Now" on a pending fee
4. Razorpay checkout modal opens
5. Enter test card details
6. Complete payment
7. Verify payment status updates to "PAID"

## Step 7: Go Live

### Before Going Live
1. Complete KYC verification on Razorpay Dashboard
2. Replace test keys with live keys in `.env` files
3. Test with small real transactions
4. Set up webhooks for payment notifications (optional but recommended)

### Webhook Setup (Optional)
Webhooks notify your server about payment events automatically.

Add to `backend/routes/webhookRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');

router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();
    
    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    
    if (signature === expectedSignature) {
        const event = JSON.parse(body);
        
        if (event.event === 'payment.captured') {
            // Handle successful payment
            const payment = event.payload.payment.entity;
            // Update database based on payment notes
        }
    }
    
    res.json({ status: 'ok' });
});

module.exports = router;
```

## Security Best Practices

1. **Never expose Key Secret** on frontend
2. **Always verify signature** on backend
3. **Use HTTPS** in production
4. **Store payment IDs** for reconciliation
5. **Implement rate limiting** on payment endpoints
6. **Log all transactions** for audit trail

## Admin Features (Optional)

Add payment reconciliation in admin panel:
- View all transactions
- Match Razorpay payments with fee records
- Generate payment reports
- Handle refunds

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Dashboard: https://dashboard.razorpay.com/test/dashboard

## Summary

This integration provides:
- ✅ Secure payment processing
- ✅ Real-time payment verification
- ✅ Multiple payment methods (Cards, UPI, Netbanking, Wallets)
- ✅ Automatic fee status updates
- ✅ Payment tracking and reconciliation
- ✅ Test mode for development
