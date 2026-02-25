# 5. Webhooks — Real-Time Event Handling

## Overview

Webhooks are **automatic notifications from Razorpay to your server**. Whenever something happens on Razorpay's side (payment succeeds, refund processes, link gets paid), they immediately POST the details to your server. This ensures your database stays in sync even if the customer's browser crashes or network fails.

## Why Webhooks Are Critical

**Without webhooks:** If a customer pays but their browser crashes before the "verify" step completes, your system would think the payment never happened — even though money was deducted from the customer.

**With webhooks:** Razorpay separately notifies your server within 1-2 minutes, so the invoice gets marked as PAID regardless of what happens on the customer's browser.

## Webhook Endpoint

Your server listens at:
```
POST /api/payments/webhook
```

This endpoint is **publicly accessible** (no JWT authentication required) because Razorpay needs to reach it. Instead, it uses **signature verification** to ensure the request actually came from Razorpay.

## How Signature Verification Works

```typescript
// server/src/routes/payments.ts — POST /webhook
router.post('/webhook', async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const receivedSignature = req.headers['x-razorpay-signature'] as string;
    
    // Razorpay signs the webhook body with your webhook secret
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    if (receivedSignature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Signature valid — process the event
    const event = req.body.event;
    const payload = req.body.payload;
    
    // Route to appropriate handler based on event type
    switch (event) {
        case 'payment.authorized':
            // Payment authorized but not yet captured
            break;
        case 'payment.captured':
            // Payment successfully captured — money is yours
            await handlePaymentCaptured(payload);
            break;
        case 'payment.failed':
            // Payment failed
            await handlePaymentFailed(payload);
            break;
        case 'order.paid':
            // Order fully paid
            await handleOrderPaid(payload);
            break;
        case 'refund.created':
            // Refund initiated
            break;
        case 'refund.processed':
            // Refund money sent to customer
            await handleRefundProcessed(payload);
            break;
        case 'refund.failed':
            // Refund failed
            break;
        case 'payment_link.paid':
            // Customer paid via payment link
            await handlePaymentLinkPaid(payload);
            break;
    }
    
    res.json({ status: 'ok' });
});
```

## Events Your Server Handles

| Event | When It Fires | What Your Server Does |
|-------|--------------|----------------------|
| `payment.authorized` | Customer's bank approves the payment | Log event (payment not yet captured) |
| `payment.captured` | Money is successfully captured | Update Invoice → `PAID` |
| `payment.failed` | Payment failed (card declined, UPI timeout) | Log failure, optionally notify admin |
| `order.paid` | Entire order amount is paid | Update Invoice → `PAID` |
| `refund.created` | Refund has been initiated | Log event |
| `refund.processed` | Refund money sent to customer | Update Invoice → `REFUNDED` |
| `refund.failed` | Refund failed | Flag for manual review |
| `payment_link.paid` | Customer paid through a payment link | Update Invoice → `PAID` |

## Setting Up Webhooks in Razorpay Dashboard

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings → Webhooks**
3. Click **"Add New Webhook"**
4. Configure:
   - **Webhook URL:** `https://yourdomain.com/api/payments/webhook`
   - **Secret:** Create a strong random secret → Copy to your `.env` as `RAZORPAY_WEBHOOK_SECRET`
   - **Active Events:** Select all the events listed above
   - **Alert Email:** Your admin email for failed webhook delivery notifications

## Local Development with Webhooks

Since webhooks need a public URL, use **ngrok** for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server (port 5000) to the internet
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
# Use this as your webhook URL: https://abc123.ngrok.io/api/payments/webhook
```

## Webhook Retry Policy

If your server doesn't respond with `200 OK`, Razorpay retries:
- **Retry 1:** After 5 minutes
- **Retry 2:** After 30 minutes
- **Retry 3:** After 1 hour
- **Retry 4:** After 3 hours
- **Retry 5:** After 6 hours

After 5 failed retries, the webhook is marked as failed and you'll receive an email alert.

## Idempotency

Your webhook handler should be **idempotent** — meaning processing the same event twice should not cause duplicate updates. This is because Razorpay may send the same webhook multiple times.

Best practice: Check if the invoice is already `PAID` before updating it again.
