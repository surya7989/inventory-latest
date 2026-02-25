import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.ts';
import productRoutes from './routes/products.ts';
import customerRoutes from './routes/customers.ts';
import invoiceRoutes from './routes/invoices.ts';
import paymentRoutes from './routes/payments.ts';
import vendorRoutes from './routes/vendors.ts';
import purchaseRoutes from './routes/purchases.ts';
import expenseRoutes from './routes/expenses.ts';

dotenv.config();


const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173', // Vite default
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);


// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 NexaRats Backend running on http://localhost:${PORT}`);
});

