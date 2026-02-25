# 2. Checkout Payment Flow

## Overview

This is the primary payment flow — when a customer buys something and pays online through Razorpay's secure popup modal.

## Where It's Used

- **Billing Page** (`/billing`) — When cashier selects "Pay with Razorpay"
- **Storefront Page** (`/storefront`) — When customer clicks "Pay Now" on the public store

## Step-by-Step Flow

```
Customer clicks         Frontend creates      Razorpay returns       Frontend opens
"Pay with Razorpay" ──► order via backend ──► order_id + key_id ──► checkout popup
                                                                        │
                                                                        ▼
                                                                   Customer pays
                                                                   via UPI/Card/
                                                                   NetBanking
                                                                        │
                                                                        ▼
                                                              Razorpay returns
                                                              signature + IDs
                                                                        │
                                                                        ▼
                                                              Backend verifies
                                                              HMAC signature
                                                                        │
                                                                        ▼
                                                              Invoice marked
                                                              as PAID ✅
```

## Detailed Process

### Step 1: Customer Initiates Payment
When the customer clicks "Pay with Razorpay," the frontend calls the `useRazorpay` hook:

```typescript
// src/hooks/useRazorpay.ts
const initiatePayment = async ({ amount, customerName, customerEmail, customerPhone, invoiceId, onSuccess, onFailure }) => {
    // 1. Load Razorpay script (if not already loaded)
    await loadRazorpayScript();
    
    // 2. Create order on backend
    const response = await api.post('/payments/create-order', {
        amount: amount * 100,  // Convert ₹ to paise (₹500 = 50000 paise)
        currency: 'INR',
        invoiceId,
        receipt: `rcpt_${invoiceId}`,
        notes: { invoiceId }
    });
    
    // 3. Open Razorpay checkout modal
    const options = {
        key: response.data.key_id,
        amount: response.data.order.amount,
        currency: 'INR',
        name: 'NEXA POS',
        description: 'Invoice Payment',
        order_id: response.data.order.id,
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        theme: { color: '#6366F1' },
        handler: async (response) => {
            // 4. Verify payment on backend
            const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId
            });
            if (verifyRes.data.verified) onSuccess(verifyRes.data);
        },
        modal: { ondismiss: () => onFailure() }
    };
    
    new window.Razorpay(options).open();
};
```

### Step 2: Backend Creates Razorpay Order
```typescript
// server/src/routes/payments.ts — POST /create-order
router.post('/create-order', authenticate, async (req, res) => {
    const { amount, currency, notes, invoiceId, receipt } = orderSchema.parse(req.body);
    
    const order = await razorpay.orders.create({
        amount,           // In paise (50000 = ₹500)
        currency,         // "INR"
        receipt,          // Your internal reference
        notes             // Metadata (invoiceId, etc.)
    });
    
    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
});
```

### Step 3: Customer Sees Razorpay Popup
The Razorpay popup appears with:
- Your business name and logo
- Total amount to pay
- Payment options: **UPI** (Google Pay, PhonePe, Paytm), **Cards** (Visa, Mastercard, RuPay), **NetBanking** (50+ banks), **Wallets**

The customer completes payment within this secure popup. **Your app never touches the card number or UPI PIN.**

### Step 4: Backend Verifies the Signature
This is the most critical security step:

```typescript
// server/src/routes/payments.ts — POST /verify
router.post('/verify', authenticate, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = verifySchema.parse(req.body);
    
    // Create expected signature using your secret key
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    
    // Compare signatures
    if (expectedSignature === razorpay_signature) {
        // ✅ Payment is genuine!
        // Update invoice status in database
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            }
        });
        
        res.json({ verified: true, payment: { orderId, paymentId } });
    } else {
        // ❌ Signature mismatch — possible tampering!
        res.status(400).json({ verified: false });
    }
});
```

### Step 5: Invoice Updated
After successful verification:
- Invoice `status` → `PAID`
- `razorpayOrderId` → Stored for reference
- `razorpayPaymentId` → Stored for refund capability
- Product stock → Already decremented when invoice was created
- Customer's `totalPaid` → Updated

## What the Customer Sees

1. **Billing/Storefront page** → Clicks "Pay with Razorpay"
2. **Razorpay popup** → Selects UPI/Card/NetBanking → Enters details → Confirms
3. **Success screen** → "Payment Successful" → Invoice preview with print option

## Error Scenarios

| Scenario | What Happens |
|----------|-------------|
| Customer closes popup | `onFailure()` called → "Payment cancelled" message |
| Card declined | Razorpay shows error in popup → Customer can retry |
| Network error during verify | Webhook will handle it (see [5-WEBHOOKS.md](./5-WEBHOOKS.md)) |
| Signature mismatch | Backend returns `verified: false` → Payment flagged |

## Supported Payment Methods

| Method | Type | Settlement Time |
|--------|------|----------------|
| UPI | Google Pay, PhonePe, Paytm, BHIM | Instant |
| Debit Cards | Visa, Mastercard, RuPay | T+2 days |
| Credit Cards | Visa, Mastercard, Amex | T+2 days |
| NetBanking | 50+ Indian banks | T+2 days |
| Wallets | Paytm, PhonePe, Amazon Pay | T+2 days |
| EMI | Card-based EMI | T+2 days |
