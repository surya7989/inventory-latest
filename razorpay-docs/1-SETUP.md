# 1. Razorpay Setup & Configuration

## What is Razorpay?

Razorpay is India's leading payment gateway that allows businesses to accept online payments through multiple methods — UPI, Credit/Debit Cards, NetBanking, Wallets (Paytm, PhonePe), and EMI options. It handles all the security (PCI-DSS compliance) so you don't have to store sensitive card data.

## How to Get Started

### Step 1: Create a Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **"Sign Up"** → Enter your email, phone, business name
3. Complete KYC verification (PAN, Aadhaar, Bank Account)
4. Once verified, you get access to the **Razorpay Dashboard**

### Step 2: Get Your API Keys
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings → API Keys**
3. Click **"Generate Key"**
4. You will receive:
   - **Key ID** (e.g., `rzp_test_xxxxxxxxxxxx`) — Public, used in frontend
   - **Key Secret** (e.g., `xxxxxxxxxxxxxxxxxx`) — Private, used in backend only

> ⚠️ **IMPORTANT:** Razorpay provides two modes:
> - **Test Mode:** For development/testing. No real money is charged. Keys start with `rzp_test_`
> - **Live Mode:** For production. Real money transactions. Keys start with `rzp_live_`

### Step 3: Set Up Webhook Secret
1. In Razorpay Dashboard → **Settings → Webhooks**
2. Click **"Add New Webhook"**
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen to:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
   - `refund.processed`
   - `refund.failed`
   - `payment_link.paid`
5. Copy the **Webhook Secret** generated

### Step 4: Configure Your Server

Create or update your `server/.env` file:

```env
# Server
PORT=5000

# JWT Secrets (for authentication, not Razorpay)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# ─────────────────────────────────────────
# RAZORPAY CONFIGURATION
# ─────────────────────────────────────────

# Test Mode Keys (for development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Database
DATABASE_URL=file:./dev.db
```

### Step 5: Install SDK (Already Done in Your Project)

Your backend already has the Razorpay SDK installed:
```json
// server/package.json
"razorpay": "^2.9.6"
```

The SDK is initialized in `server/src/routes/payments.ts`:
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

## What Razorpay Charges You

| Plan | Monthly Fee | Transaction Fee |
|------|------------|----------------|
| **Standard** | ₹0 | 2% per transaction |
| **Plus** | Custom | 2% per transaction + premium features |

- **UPI payments:** 0% (currently free)
- **Domestic Cards:** 2%
- **International Cards:** 3%
- **NetBanking:** 2%
- **Refunds:** No fee charged by Razorpay

## File Locations in Your Project

| Purpose | File Path |
|---------|-----------|
| Backend SDK initialization | `server/src/routes/payments.ts` |
| Frontend hook | `src/hooks/useRazorpay.ts` |
| Frontend UI components | `src/components/RazorpayComponents.tsx` |
| Environment variables | `server/.env` |
| Example env | `server/.env.example` |
