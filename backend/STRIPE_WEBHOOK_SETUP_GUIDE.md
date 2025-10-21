# Stripe Webhook Setup Guide

## Problem Identified
Your orders are stuck in "pending" payment status because Stripe webhooks are not properly configured. The webhook secret is set to `whsec_xxx` (placeholder) instead of a real webhook secret.

## Why This Happens
1. **Webhook Secret Missing**: Your `.env` has `STRIPE_WEBHOOK_SECRET=whsec_xxx` (placeholder)
2. **Webhook Events Rejected**: Stripe sends webhook events but they fail signature verification
3. **Payment Status Never Updated**: Orders remain "pending" forever
4. **Profile Page Shows Warnings**: Because many orders have payment issues

## How to Fix This

### Step 1: Set Up Stripe Webhook
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/payments/webhook`
   - For local development: Use ngrok or similar tool
   - For production: Use your actual domain
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.updated`
5. Click "Add endpoint"
6. Copy the webhook secret (starts with `whsec_`)

### Step 2: Update Environment Variables
Replace the placeholder in your `.env` file:
```bash
# OLD (placeholder)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# NEW (real webhook secret from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

### Step 3: Test Webhook
Use the test endpoint to verify webhook is working:
```bash
curl -X GET https://yourdomain.com/payments/webhook-test
```

### Step 4: Fix Old Orders
Run the bulk payment status fix to update old pending orders.

## Current Status
- ✅ Stripe API working (test mode)
- ✅ Checkout sessions creating successfully  
- ❌ Webhook signature verification failing
- ❌ Payment status updates not happening
- ❌ Orders stuck in "pending" status

## Impact
- 28 orders showing "Payment: pending"
- Profile page shows payment warnings
- Users see "Payment processing..." for old orders
- Admin dashboard shows many pending payments

## Next Steps
1. Set up proper Stripe webhook endpoint
2. Update webhook secret in environment
3. Test webhook functionality
4. Run bulk payment status fix for old orders
5. Verify all orders show correct payment status



