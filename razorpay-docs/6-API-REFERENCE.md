# 6. API Reference — All Razorpay Endpoints

## Base URL
```
http://localhost:5000/api/payments
```

All endpoints (except webhook) require JWT authentication via `Authorization: Bearer <token>` header.

---

## Orders

### Create Order
```http
POST /create-order
```
**Purpose:** Creates a Razorpay order before opening checkout popup.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount in **paise** (₹500 = 50000). Minimum: 100 |
| `currency` | string | Yes | Always `"INR"` |
| `receipt` | string | No | Your internal reference (e.g., `rcpt_inv123`) |
| `notes` | object | No | Metadata (e.g., `{ invoiceId: "abc" }`) |
| `invoiceId` | string | No | Your invoice ID for tracking |

**Response:**
```json
{
  "order": {
    "id": "order_xxxxxxxxxx",
    "amount": 50000,
    "currency": "INR",
    "status": "created"
  },
  "key_id": "rzp_test_xxxxxxxxxx"
}
```

### Fetch Order
```http
GET /order/:orderId
```
**Response:** Full order details from Razorpay.

### Fetch Order Payments
```http
GET /order/:orderId/payments
```
**Response:** All payments made against this order.

---

## Payment Verification

### Verify Payment Signature
```http
POST /verify
```
**Purpose:** Verifies that the payment was not tampered with.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `razorpay_order_id` | string | Yes | From Razorpay checkout response |
| `razorpay_payment_id` | string | Yes | From Razorpay checkout response |
| `razorpay_signature` | string | Yes | From Razorpay checkout response |
| `invoiceId` | string | No | Your invoice ID to update |

**Response:**
```json
{
  "verified": true,
  "payment": {
    "orderId": "order_xxxxxxxxxx",
    "paymentId": "pay_xxxxxxxxxx"
  }
}
```

### Capture Payment
```http
POST /capture/:paymentId
```
**Purpose:** Manually captures an authorized payment.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount to capture in paise |
| `currency` | string | Yes | `"INR"` |

---

## Payments

### Fetch Payment
```http
GET /fetch/:paymentId
```
**Response:** Detailed payment status, method, card/UPI details, timeline.

### List All Payments
```http
GET /list
```
**Query Params:** `from`, `to`, `count`, `skip`
**Response:** Array of all payments on your Razorpay account.

---

## Refunds

### Create Refund
```http
POST /refund/:paymentId
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | No | Amount in paise. If omitted → full refund |
| `speed` | string | No | `"optimum"` (instant for UPI) or `"normal"` |
| `notes` | object | No | Metadata |
| `invoiceId` | string | No | Your invoice ID to update status to REFUNDED |

**Response:**
```json
{
  "refund": {
    "id": "rfnd_xxxxxxxxxx",
    "amount": 50000,
    "status": "processed",
    "speed_processed": "instant"
  }
}
```

### Fetch Refund
```http
GET /refund/:refundId
```
**Response:** Refund status and details.

---

## Payment Links

### Create Payment Link
```http
POST /payment-link
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount in paise. Minimum: 100 |
| `currency` | string | Yes | `"INR"` |
| `description` | string | Yes | Payment description shown to customer |
| `customerName` | string | No | Customer's name |
| `customerEmail` | string | No | Email to send link to |
| `customerPhone` | string | No | Phone to send SMS to |
| `expireBy` | number | No | Unix timestamp for link expiry |
| `reminderEnable` | boolean | No | Send automatic reminders |
| `invoiceId` | string | No | Your invoice ID |

**Response:**
```json
{
  "paymentLink": {
    "id": "plink_xxxxxxxxxx",
    "short_url": "https://rzp.io/i/abc123",
    "status": "created",
    "amount": 50000
  }
}
```

### Fetch Payment Link
```http
GET /payment-link/:id
```

### Cancel Payment Link
```http
PATCH /payment-link/:id/cancel
```

---

## Webhook

### Receive Webhook Events
```http
POST /webhook
```
**Auth:** No JWT. Uses `x-razorpay-signature` header for verification.

**Request Headers:**
```
x-razorpay-signature: <HMAC-SHA256 hash>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxxxxxxx",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_xxxxxxxxxx",
        "method": "upi"
      }
    }
  }
}
```

**Response:** `200 { status: "ok" }`
