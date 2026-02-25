import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const invoiceSchema = z.object({
    number: z.string(),
    customerId: z.string().optional().nullable(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number(),
        gst: z.number(),
    })),
    subtotal: z.number(),
    gstAmount: z.number(),
    total: z.number(),
    paidAmount: z.number().optional().default(0),
    method: z.string(),
    status: z.string().default('COMPLETED'),
    source: z.string().default('offline'),
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    orderStatus: z.string().optional().default('Pending'),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { items: true, customer: true }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = invoiceSchema.parse(req.body);
        const { items, ...invoiceData } = validated;

        const invoice = await prisma.invoice.create({
            data: {
                ...invoiceData,
                userId: req.user!.userId,
                items: {
                    create: items
                }
            },
            include: { items: true }
        });

        // Update stock levels
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        res.status(201).json(invoice);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create invoice' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = invoiceSchema.partial().parse(req.body);
        const { items, ...updateData } = validated;

        // Type cast to any to bypass strict Prisma type check for the partial object
        // or specifically handle the null/undefined fields.
        const invoice = await prisma.invoice.update({
            where: { id: req.params.id as string },
            data: updateData as any,
            include: { items: true, customer: true }
        });
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update invoice' });
    }
});

export default router;
