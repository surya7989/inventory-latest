import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const purchaseSchema = z.object({
    number: z.string(),
    vendorId: z.string(),
    items: z.array(z.object({
        productName: z.string(),
        productId: z.string().optional().nullable(),
        quantity: z.number(),
        price: z.number(),
        gst: z.number(),
    })),
    subtotal: z.number(),
    gstAmount: z.number(),
    total: z.number(),
    paidAmount: z.number().default(0),
    status: z.string().default('Received'),
    paymentStatus: z.string().default('Unpaid'),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const purchases = await prisma.purchase.findMany({
            include: { items: true, vendor: true }
        });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = purchaseSchema.parse(req.body);
        const { items, ...purchaseData } = validated;

        const purchase = await prisma.purchase.create({
            data: {
                ...purchaseData,
                items: {
                    create: items
                }
            },
            include: { items: true }
        });

        // Update stock levels if productId exists
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }
        }

        res.status(201).json(purchase);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create purchase' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = purchaseSchema.partial().parse(req.body);
        const { items, ...updateData } = validated;

        const purchase = await prisma.purchase.update({
            where: { id: req.params.id },
            data: updateData as any,
            include: { items: true, vendor: true }
        });
        res.json(purchase);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update purchase' });
    }
});

export default router;
