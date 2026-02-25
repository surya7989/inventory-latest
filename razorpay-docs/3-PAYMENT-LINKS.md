# 3. Payment Links

## Overview

Payment Links allow you to collect money from customers who are **not currently on your website**. You generate a link, send it via SMS/Email/WhatsApp, and the customer pays through it. No coding needed on the customer's side — they just click the link and pay.

## Where It's Used

- **Billing Page** (`/billing`) — `PaymentLinkButton` component appears after invoice is created

## How It Works

```
You click "Send          Backend creates         Razorpay sends         Customer clicks
Payment Link" ────────► link via Razorpay ────► SMS/Email to ────────► link and pays
                         API                    customer                    │
                                                                           ▼
                                                                    Razorpay webhook
                                                                    notifies your server
                                                                           │
                                                                           ▼
                                                                    Invoice auto-marked
                                                                    as PAID ✅
```

## Detailed Process

### Step 1: Create Payment Link

```typescript
// Frontend — PaymentLinkButton component
const handleCreate = async () => {
    const link = await createPaymentLink({
        amount: invoiceTotal * 100,  // In paise
        currency: 'INR',
        description: `Payment for Invoice #${invoiceId}`,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '9876543210',
        invoiceId: invoiceId,
        reminderEnable: true,
        expireBy: Math.floor(Date.now() / 1000) + 86400 * 3  // Expires in 3 days
    });
    // link.short_url → "https://rzp.io/i/abc123"
};
```

### Step 2: Backend Creates Link via Razorpay API

```typescript
// server/src/routes/payments.ts — POST /payment-link
router.post('/payment-link', authenticate, async (req, res) => {
    const data = paymentLinkSchema.parse(req.body);
    
    const paymentLink = await razorpay.paymentLink.create({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        customer: {
            name: data.customerName,
            email: data.customerEmail,
            contact: data.customerPhone,
        },
        notify: {
            sms: true,    // Razorpay sends SMS automatically
            email: true,  // Razorpay sends email automatically
        },
        reminder_enable: data.reminderEnable,
        expire_by: data.expireBy,
        notes: { invoiceId: data.invoiceId },
    });
    
    res.json({ paymentLink });
});
```

### Step 3: What the Customer Receives

**SMS Example:**
> Hi John, you have a payment of ₹500.00 from NEXA POS. Pay now: https://rzp.io/i/abc123

**Email Example:**
> Subject: Payment Request from NEXA POS
> Body: You have received a payment request of ₹500.00. Click below to pay securely.
> [Pay Now Button]

### Step 4: Customer Pays
The customer clicks the link → Razorpay shows a payment page → Customer pays via UPI/Card/NetBanking.

### Step 5: Automatic Webhook Notification
Once paid, Razorpay sends a `payment_link.paid` event to your webhook endpoint → Your server updates the invoice.

## Payment Link Features

| Feature | Description |
|---------|-------------|
| **Auto SMS/Email** | Razorpay automatically sends the link to customer |
| **Short URL** | Clean shareable link (e.g., `https://rzp.io/i/abc123`) |
| **Expiry** | Links can expire after a set time |
| **Reminders** | Razorpay sends automatic payment reminders |
| **Partial Payments** | Can be configured for partial payments |
| **Copy & Share** | Frontend shows a "Copy Link" button for WhatsApp sharing |

## Managing Payment Links

```typescript
// Fetch link status
GET /api/payments/payment-link/:id

// Cancel an unpaid link
PATCH /api/payments/payment-link/:id/cancel
```

## Use Cases

| Scenario | How |
|----------|-----|
| Customer forgot to pay | Send payment link via WhatsApp |
| Phone order | Create invoice → Send payment link via SMS |
| Recurring invoice | Create new payment link each billing cycle |
| Deposit/Advance | Send partial amount link before delivery |
