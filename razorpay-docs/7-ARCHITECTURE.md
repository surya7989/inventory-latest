# 7. System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER'S BROWSER                           │
│                                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────────────┐   │
│  │ Billing Page │   │  Storefront  │   │   Customers Page          │   │
│  │              │   │              │   │                           │   │
│  │ [Pay with    │   │ [Pay Now]    │   │ [Refund] [Payment Link]   │   │
│  │  Razorpay]   │   │              │   │                           │   │
│  └──────┬───────┘   └──────┬───────┘   └───────────┬───────────────┘   │
│         │                  │                       │                    │
│         └──────────────────┼───────────────────────┘                    │
│                            │                                            │
│                    ┌───────▼────────┐                                   │
│                    │  useRazorpay   │  ← Custom React Hook              │
│                    │  Hook          │     (src/hooks/useRazorpay.ts)     │
│                    │                │                                    │
│                    │ • loadScript() │  Loads Razorpay SDK dynamically    │
│                    │ • initiate()   │  Creates order + opens popup       │
│                    │ • verify()     │  Verifies payment signature        │
│                    │ • refund()     │  Processes refund                  │
│                    │ • createLink() │  Creates payment link              │
│                    └───────┬────────┘                                    │
│                            │                                            │
│         ┌──────────────────┼──────────────────┐                        │
│         │                  │                  │                         │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐                 │
│  │ RazorpayPay │   │ PaymentLink │   │   Refund    │                  │
│  │ Button      │   │ Button      │   │   Button    │                  │
│  │ (Component) │   │ (Component) │   │ (Component) │                  │
│  └─────────────┘   └─────────────┘   └─────────────┘                  │
│                                                                         │
│                    ┌───────────────────────┐                            │
│                    │   Razorpay Checkout   │  ← Razorpay's secure       │
│                    │   Popup Modal         │     hosted popup            │
│                    │                       │     (checkout.razorpay.com) │
│                    │   UPI | Cards | Net   │                            │
│                    └───────────────────────┘                            │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS (Axios)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       YOUR BACKEND SERVER                               │
│                    (Express.js — Port 5000)                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │              payments.ts (478 lines, 12 endpoints)          │       │
│  │                                                             │       │
│  │  ORDERS ─────────────────────────────────                   │       │
│  │  POST /create-order    → razorpay.orders.create()           │       │
│  │  GET  /order/:id       → razorpay.orders.fetch()            │       │
│  │  GET  /order/:id/pmts  → razorpay.orders.fetchPayments()    │       │
│  │                                                             │       │
│  │  VERIFICATION ───────────────────────────                   │       │
│  │  POST /verify          → HMAC-SHA256 signature check        │       │
│  │  POST /capture/:id     → razorpay.payments.capture()        │       │
│  │                                                             │       │
│  │  PAYMENTS ───────────────────────────────                   │       │
│  │  GET  /fetch/:id       → razorpay.payments.fetch()          │       │
│  │  GET  /list            → razorpay.payments.all()            │       │
│  │                                                             │       │
│  │  REFUNDS ────────────────────────────────                   │       │
│  │  POST /refund/:id      → razorpay.payments.refund()         │       │
│  │  GET  /refund/:id      → razorpay.refunds.fetch()           │       │
│  │                                                             │       │
│  │  PAYMENT LINKS ──────────────────────────                   │       │
│  │  POST  /payment-link   → razorpay.paymentLink.create()      │       │
│  │  GET   /payment-link/:id → razorpay.paymentLink.fetch()     │       │
│  │  PATCH /payment-link/:id/cancel → .paymentLink.cancel()     │       │
│  │                                                             │       │
│  │  WEBHOOK ────────────────────────────────                   │       │
│  │  POST /webhook         → Signature verify + event routing   │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                          │
│                    ┌────────▼─────────┐                                │
│                    │   Prisma ORM     │                                │
│                    │                  │                                │
│                    │  Invoice.update  │  Updates status: PAID/REFUNDED │
│                    │  Invoice.find    │  Links Razorpay IDs            │
│                    └────────┬─────────┘                                │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                     ┌────────▼─────────┐
                     │   SQLite (DB)    │
                     │                  │
                     │  Invoice Table   │
                     │  • status        │
                     │  • razorpayOrdId │
                     │  • razorpayPmtId │
                     │  • paidAmount    │
                     └──────────────────┘

                              ▲
               Async Webhooks │ (HTTPS POST)
                              │
                     ┌────────┴─────────┐
                     │   RAZORPAY API   │
                     │   (External)     │
                     │                  │
                     │  • Orders API    │
                     │  • Payments API  │
                     │  • Refunds API   │
                     │  • Links API     │
                     │  • Webhooks      │
                     └──────────────────┘
```

## Data Flow: Checkout Payment

```
Step 1: Customer → clicks "Pay with Razorpay"
Step 2: Frontend → POST /api/payments/create-order { amount: 50000 }
Step 3: Backend  → razorpay.orders.create() → returns order_id
Step 4: Frontend → opens Razorpay popup with order_id
Step 5: Customer → pays via UPI/Card in popup
Step 6: Popup    → returns { order_id, payment_id, signature }
Step 7: Frontend → POST /api/payments/verify { order_id, payment_id, signature }
Step 8: Backend  → HMAC verify → prisma.invoice.update({ status: 'PAID' })
Step 9: Frontend → shows success screen + invoice preview
```

## Data Flow: Payment Link

```
Step 1: Admin    → clicks "Send Payment Link"
Step 2: Frontend → POST /api/payments/payment-link { amount, customer }
Step 3: Backend  → razorpay.paymentLink.create() → returns short_url
Step 4: Razorpay → sends SMS/Email to customer automatically
Step 5: Customer → opens link → pays on Razorpay page
Step 6: Razorpay → POST /api/payments/webhook { event: 'payment_link.paid' }
Step 7: Backend  → prisma.invoice.update({ status: 'PAID' })
```

## Data Flow: Refund

```
Step 1: Admin    → clicks "Refund" on customer transaction
Step 2: Frontend → POST /api/payments/refund/:paymentId { amount }
Step 3: Backend  → razorpay.payments.refund() → processes refund
Step 4: Backend  → prisma.invoice.update({ status: 'REFUNDED' })
Step 5: Razorpay → returns money to customer (instant for UPI, 5-7 days for cards)
Step 6: Razorpay → POST /api/payments/webhook { event: 'refund.processed' }
```

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                     │
│                                                      │
│  Layer 1: HTTPS (TLS encryption in transit)          │
│  Layer 2: JWT Authentication (all endpoints)         │
│  Layer 3: HMAC-SHA256 Signature (payment verify)     │
│  Layer 4: Webhook Signature (server-to-server)       │
│  Layer 5: Razorpay PCI-DSS (card data never          │
│           touches your server)                       │
│  Layer 6: Zod Validation (input sanitization)        │
└──────────────────────────────────────────────────────┘
```

## Database Fields Used by Razorpay

```sql
-- Invoice table (Prisma model)
Invoice {
    id               String    -- Your internal invoice ID
    status           String    -- "PENDING" | "PAID" | "REFUNDED"
    razorpayOrderId  String?   -- Razorpay order_xxxxxxxxxx
    razorpayPaymentId String?  -- Razorpay pay_xxxxxxxxxx
    paidAmount       Float     -- Amount actually paid
    paymentMethod    String    -- "razorpay" | "cash" | "upi" | etc.
    source           String    -- "online" | "offline"
}
```

## File Map

```
Your Project
├── src/
│   ├── hooks/
│   │   └── useRazorpay.ts          ← Frontend hook (227 lines)
│   └── components/
│       └── RazorpayComponents.tsx   ← UI components (239 lines)
│           ├── RazorpayPayButton    ← "Pay with Razorpay" button
│           ├── PaymentLinkButton    ← "Send Payment Link" button
│           └── RefundButton         ← "Refund" button with amount input
│
├── server/
│   └── src/
│       └── routes/
│           └── payments.ts          ← All 12 API endpoints (478 lines)
│
└── razorpay-docs/                   ← This folder (you are here)
    ├── README.md
    ├── 1-SETUP.md
    ├── 2-CHECKOUT-FLOW.md
    ├── 3-PAYMENT-LINKS.md
    ├── 4-REFUNDS.md
    ├── 5-WEBHOOKS.md
    ├── 6-API-REFERENCE.md
    └── 7-ARCHITECTURE.md
```
