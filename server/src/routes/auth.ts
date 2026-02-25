import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../validators/auth.ts';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth.ts';
import prisma from '../utils/prisma.ts';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const validated = registerSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        const user = await prisma.user.create({
            data: {
                ...validated,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const validated = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: validated.email } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(validated.password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid password' });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            accessToken,
            user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName }
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/refresh', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    try {
        const payload = verifyRefreshToken(refreshToken) as { userId: string };
        const newAccessToken = generateAccessToken(payload.userId);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});

export default router;

