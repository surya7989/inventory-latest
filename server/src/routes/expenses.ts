import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { z } from 'zod';
import prisma from '../utils/prisma.ts';

const router = express.Router();

const expenseSchema = z.object({
    amount: z.number(),
    category: z.string(),
    description: z.string().optional().nullable(),
    date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
    method: z.string().default('Cash'),
    refId: z.string().optional().nullable(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = expenseSchema.parse(req.body);
        const expense = await prisma.expense.create({
            data: validated
        });
        res.status(201).json(expense);
    } catch (error: any) {
        if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
        res.status(400).json({ error: 'Failed to create expense' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const validated = expenseSchema.partial().parse(req.body);
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: validated
        });
        res.json(expense);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update expense' });
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.expense.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete expense' });
    }
});

export default router;
