import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const vendorSchema = z.object({
    name: z.string(),
    contactPerson: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.string().default('Active'),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const vendors = await prisma.vendor.findMany({
            include: { purchases: true }
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = vendorSchema.parse(req.body);
        const vendor = await prisma.vendor.create({
            data: validated
        });
        res.status(201).json(vendor);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create vendor' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = vendorSchema.partial().parse(req.body);
        const vendor = await prisma.vendor.update({
            where: { id: req.params.id },
            data: validated
        });
        res.json(vendor);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update vendor' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.vendor.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete vendor' });
    }
});

export default router;
