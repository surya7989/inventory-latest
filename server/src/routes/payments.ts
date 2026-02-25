import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order (required before opening the checkout modal)
 * Amount must be in paise (₹1 = 100 paise)
 */
const orderSchema = z.object({
    amount: z.number().min(100, 'Minimum amount is ₹1 (100 paise)'),
    currency: z.string().default('INR'),
    notes: z.record(z.string()).optional(),
    invoiceId: z.string().optional(),   // link to our invoice
    receipt: z.string().optional(),
});

router.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = orderSchema.parse(req.body);
        const order = await razorpay.orders.create({
            amount: validated.amount,
            currency: validated.currency,
            receipt: validated.receipt || `rcpt_${Date.now()}`,
            notes: {
                invoiceId: validated.invoiceId || '',
                ...(validated.notes || {}),
            },
        });
        res.json({
            ...order,
            key_id: process.env.RAZORPAY_KEY_ID,   // Send to frontend for checkout
        });
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Failed to create Razorpay order', details: error.message });
    }
});

/**
 * GET /api/payments/order/:orderId
 * Fetch details of a specific Razorpay order
 */
router.get('/order/:orderId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const order = await razorpay.orders.fetch(req.params.orderId);
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch order', details: error.message });
    }
});

/**
 * GET /api/payments/order/:orderId/payments
 * Fetch all payments for a specific order
 */
router.get('/order/:orderId/payments', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payments = await razorpay.orders.fetchPayments(req.params.orderId);
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch order payments', details: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT VERIFICATION & CAPTURE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/verify
 * Verifies Razorpay signature after frontend checkout completes.
 * Also updates the local invoice status to "PAID".
 */
const verifySchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    invoiceId: z.string().optional(),
});

router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } =
            verifySchema.parse(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (razorpay_signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update invoice status in DB if invoiceId provided
        if (invoiceId) {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'PAID' },
            }).catch(() => { });  // Silent fail if invoice not found
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
});

/**
 * POST /api/payments/capture/:paymentId
 * Manually capture an authorized payment
 * (Only needed if auto-capture is disabled in Razorpay dashboard)
 */
router.post('/capture/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        if (!amount) return res.status(400).json({ error: 'Amount is required' });

        const payment = await razorpay.payments.capture(req.params.paymentId, amount, currency);
        res.json(payment);
    } catch (error: any) {
        res.status(500).json({ error: 'Capture failed', details: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/payments/fetch/:paymentId
 * Fetch details of a single payment
 */
router.get('/fetch/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.paymentId);
        res.json(payment);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch payment', details: error.message });
    }
});

/**
 * GET /api/payments/list
 * Fetch recent payments with optional filters
 * Query: ?from=timestamp&to=timestamp&count=10&skip=0
 */
router.get('/list', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { from, to, count = '10', skip = '0' } = req.query;
        const options: Record<string, any> = {
            count: parseInt(count as string),
            skip: parseInt(skip as string),
        };
        if (from) options.from = parseInt(from as string);
        if (to) options.to = parseInt(to as string);

        const payments = await razorpay.payments.all(options);
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to list payments', details: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// REFUNDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/refund/:paymentId
 * Issue a full or partial refund on a captured payment
 * Body: { amount?: number (paise), speed?: 'normal'|'optimum', notes?: {} }
 */
const refundSchema = z.object({
    amount: z.number().optional(),   // Omit for full refund
    speed: z.enum(['normal', 'optimum']).default('normal'),
    notes: z.record(z.string()).optional(),
    invoiceId: z.string().optional(),
});

router.post('/refund/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = refundSchema.parse(req.body);
        const refundOptions: Record<string, any> = {
            speed: validated.speed,
            notes: validated.notes || {},
        };
        if (validated.amount) refundOptions.amount = validated.amount;

        const refund = await (razorpay.payments as any).refund(req.params.paymentId, refundOptions);

        // Update invoice status if invoiceId given
        if (validated.invoiceId) {
            await prisma.invoice.update({
                where: { id: validated.invoiceId },
                data: { status: 'REFUNDED' },
            }).catch(() => { });
        }

        res.json({
            success: true,
            refund,
            message: validated.amount
                ? `Partial refund of ₹${(validated.amount / 100).toFixed(2)} initiated`
                : 'Full refund initiated',
        });
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Refund failed', details: error.message });
    }
});

/**
 * GET /api/payments/refund/:refundId
 * Fetch a specific refund's details
 */
router.get('/refund/:refundId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const refund = await (razorpay as any).refunds.fetch(req.params.refundId);
        res.json(refund);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch refund', details: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT LINKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/payment-link
 * Create a Razorpay Payment Link (send via WhatsApp/SMS/Email to customer)
 */
const paymentLinkSchema = z.object({
    amount: z.number().min(100),
    currency: z.string().default('INR'),
    description: z.string().optional(),
    customerName: z.string(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    expireBy: z.number().optional(),       // Unix timestamp
    reminderEnable: z.boolean().default(true),
    invoiceId: z.string().optional(),
});

router.post('/payment-link', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = paymentLinkSchema.parse(req.body);
        const options: Record<string, any> = {
            amount: validated.amount,
            currency: validated.currency,
            description: validated.description || 'Payment Request',
            customer: {
                name: validated.customerName,
                email: validated.customerEmail || '',
                contact: validated.customerPhone || '',
            },
            notify: {
                sms: !!validated.customerPhone,
                email: !!validated.customerEmail,
            },
            reminder_enable: validated.reminderEnable,
            notes: {
                invoiceId: validated.invoiceId || '',
            },
        };
        if (validated.expireBy) options.expire_by = validated.expireBy;

        const link = await (razorpay as any).paymentLink.create(options);
        res.json({
            success: true,
            shortUrl: link.short_url,
            linkId: link.id,
            status: link.status,
            amount: `₹${(validated.amount / 100).toFixed(2)}`,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Failed to create payment link', details: error.message });
    }
});

/**
 * GET /api/payments/payment-link/:linkId
 * Fetch a payment link's status
 */
router.get('/payment-link/:linkId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const link = await (razorpay as any).paymentLink.fetch(req.params.linkId);
        res.json(link);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch payment link', details: error.message });
    }
});

/**
 * PATCH /api/payments/payment-link/:linkId/cancel
 * Cancel a payment link
 */
router.patch('/payment-link/:linkId/cancel', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const link = await (razorpay as any).paymentLink.cancel(req.params.linkId);
        res.json({ success: true, status: link.status });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to cancel payment link', details: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/webhook
 * Razorpay sends real-time events here. No auth middleware — uses signature verification.
 * Configure this URL in Razorpay Dashboard → Settings → Webhooks
 *
 * Events handled:
 *   payment.authorized  → Payment authorized (auto-capture off)
 *   payment.captured    → Payment captured (funds received)
 *   payment.failed      → Payment failed
 *   order.paid          → Full order amount paid
 *   refund.created      → Refund initiated
 *   refund.processed    → Refund completed
 *   refund.failed       → Refund failed
 *   payment_link.paid   → Payment via link completed
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;

    // Verify webhook signature
    const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

    if (webhookSecret && signature !== expectedSig) {
        console.error('❌ Razorpay webhook signature mismatch');
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    let event: any;
    try {
        event = JSON.parse(req.body.toString());
    } catch {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const eventType: string = event.event;
    const payload = event.payload;

    console.log(`📦 Razorpay webhook received: ${eventType}`);

    try {
        switch (eventType) {
            case 'payment.authorized': {
                // Payment authorized but not yet captured — log it
                const paymentId = payload?.payment?.entity?.id;
                console.log(`✅ Payment authorized: ${paymentId}`);
                break;
            }

            case 'payment.captured': {
                // Funds received — mark invoice as PAID
                const notes = payload?.payment?.entity?.notes;
                const invoiceId = notes?.invoiceId;
                const paymentId = payload?.payment?.entity?.id;
                console.log(`💰 Payment captured: ${paymentId}`);

                if (invoiceId) {
                    await prisma.invoice.update({
                        where: { id: invoiceId },
                        data: { status: 'PAID' },
                    }).catch(() => { });
                }
                break;
            }

            case 'payment.failed': {
                const paymentId = payload?.payment?.entity?.id;
                const reason = payload?.payment?.entity?.error_description;
                console.error(`❌ Payment failed: ${paymentId} — ${reason}`);
                break;
            }

            case 'order.paid': {
                // Full order amount has been paid
                const orderId = payload?.order?.entity?.id;
                const notes = payload?.order?.entity?.notes;
                const invoiceId = notes?.invoiceId;
                console.log(`✅ Order paid: ${orderId}`);

                if (invoiceId) {
                    await prisma.invoice.update({
                        where: { id: invoiceId },
                        data: { status: 'PAID' },
                    }).catch(() => { });
                }
                break;
            }

            case 'refund.created': {
                const refundId = payload?.refund?.entity?.id;
                const amount = payload?.refund?.entity?.amount;
                console.log(`🔄 Refund created: ${refundId} — ₹${(amount / 100).toFixed(2)}`);
                break;
            }

            case 'refund.processed': {
                const refundId = payload?.refund?.entity?.id;
                const notes = payload?.refund?.entity?.notes;
                const invoiceId = notes?.invoiceId;
                console.log(`✅ Refund processed: ${refundId}`);

                if (invoiceId) {
                    await prisma.invoice.update({
                        where: { id: invoiceId },
                        data: { status: 'REFUNDED' },
                    }).catch(() => { });
                }
                break;
            }

            case 'refund.failed': {
                const refundId = payload?.refund?.entity?.id;
                console.error(`❌ Refund failed: ${refundId}`);
                break;
            }

            case 'payment_link.paid': {
                const linkId = payload?.payment_link?.entity?.id;
                const notes = payload?.payment_link?.entity?.notes;
                const invoiceId = notes?.invoiceId;
                console.log(`🔗 Payment link paid: ${linkId}`);

                if (invoiceId) {
                    await prisma.invoice.update({
                        where: { id: invoiceId },
                        data: { status: 'PAID' },
                    }).catch(() => { });
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export default router;
