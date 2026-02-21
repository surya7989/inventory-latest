import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.ts';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

// Products Routes
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.create({ data: req.body });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
});

// Customers Routes
app.get('/api/customers', async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            include: { invoices: true }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Invoices Routes
app.get('/api/invoices', async (req: Request, res: Response) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { items: true, customer: true }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 NexaRats Backend running on http://localhost:${PORT}`);
});
