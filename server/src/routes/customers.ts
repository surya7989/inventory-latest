import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const customerSchema = z.object({
    name: z.string(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            include: { invoices: true }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = customerSchema.parse(req.body);
        const customer = await prisma.customer.create({ data: validated });
        res.status(201).json(customer);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create customer' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = customerSchema.partial().parse(req.body);
        const customer = await prisma.customer.update({
            where: { id: req.params.id as string },
            data: validated
        });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update customer' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.customer.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete customer' });
    }
});

export default router;
