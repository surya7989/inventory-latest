# 4. Refunds

## Overview

Refunds let you return money to a customer's original payment method. Razorpay supports both **full refunds** (return 100% of the amount) and **partial refunds** (return a portion).

## Where It's Used

- **Customers Page** (`/customers`) — `RefundButton` component appears next to each paid transaction that has a `razorpayPaymentId`

## How It Works

```
Admin clicks            Frontend calls         Backend calls          Razorpay processes
"Refund" button ──────► useRazorpay hook ────► Razorpay SDK ────────► refund to customer
                         with amount            refund API                  │
                                                                           ▼
                                                                    Money returned to
                                                                    customer's UPI/Card/
                                                                    Bank account
                                                                           │
                                                                           ▼
                                                                    Invoice status →
                                                                    REFUNDED
```

## Detailed Process

### Step 1: Admin Initiates Refund

In the Customers page, the admin clicks the "Refund" button on a paid transaction:

```typescript
// RefundButton component in src/components/RazorpayComponents.tsx
const RefundButton = ({ paymentId, amount, invoiceId, onRefundSuccess }) => {
    const { initiateRefund, loading } = useRazorpay();
    const [refundAmount, setRefundAmount] = useState(amount);
    
    const handleRefund = async () => {
        // Can enter partial amount or leave full amount
        const result = await initiateRefund(paymentId, refundAmount * 100, invoiceId);
        if (result) onRefundSuccess();
    };
};
```

### Step 2: Backend Processes Refund

```typescript
// server/src/routes/payments.ts — POST /refund/:paymentId
router.post('/refund/:paymentId', authenticate, async (req, res) => {
    const { paymentId } = req.params;
    const { amount, speed, notes, invoiceId } = refundSchema.parse(req.body);
    
    const refund = await razorpay.payments.refund(paymentId, {
        amount,           // In paise. If omitted → full refund
        speed: 'optimum', // 'optimum' = instant for UPI, normal for cards
        notes: notes || {}
    });
    
    // Update invoice status
    if (invoiceId) {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'REFUNDED' }
        });
    }
    
    res.json({ refund });
});
```

### Step 3: Money Returns to Customer

| Payment Method | Refund Time |
|---------------|-------------|
| UPI | Instant (within minutes) |
| Debit Card | 5-7 business days |
| Credit Card | 5-7 business days |
| NetBanking | 5-7 business days |
| Wallet | Instant |

## Refund Types

### Full Refund
- Returns the entire payment amount
- Don't pass `amount` parameter → Razorpay refunds everything

### Partial Refund
- Returns only a portion of the payment
- Pass specific `amount` in paise (e.g., ₹200 = 20000 paise)
- Multiple partial refunds allowed until the full amount is refunded
- Example: ₹500 payment → Refund ₹200 → Refund ₹100 → ₹200 still refundable

## Checking Refund Status

```typescript
// GET /api/payments/refund/:refundId
router.get('/refund/:refundId', authenticate, async (req, res) => {
    const refund = await razorpay.refunds.fetch(req.params.refundId);
    res.json({ refund });
});
```

## Refund Statuses (from Razorpay)

| Status | Meaning |
|--------|---------|
| `created` | Refund request created |
| `processed` | Money sent back to customer |
| `failed` | Refund failed (rare, usually retried) |

## Webhook Events for Refunds

Your server automatically receives these events:
- `refund.created` → Refund has been initiated
- `refund.processed` → Money successfully returned to customer
- `refund.failed` → Refund failed, may need manual intervention

## Cost

**Razorpay does not charge any fee for refunds.** However, the original transaction fee (2%) is not returned to you.

Example:
- Customer paid ₹1,000 → You received ₹980 (after 2% fee) → You refund ₹1,000 → ₹20 fee is lost
