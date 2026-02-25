import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const productSchema = z.object({
    name: z.string(),
    sku: z.string(),
    category: z.string(),
    price: z.number(),
    purchasePrice: z.number(),
    stock: z.number(),
    gstRate: z.number().default(18),
    unit: z.string().default('Pieces'),
    status: z.string().default('IN_STOCK'),
    image: z.string().optional(),
    taxType: z.string().default('Inclusive'),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = productSchema.parse(req.body);
        const product = await prisma.product.create({ data: validated });
        res.status(201).json(product);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create product' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = productSchema.partial().parse(req.body);
        const product = await prisma.product.update({
            where: { id: req.params.id as string },
            data: validated
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete product' });
    }
});

export default router;
