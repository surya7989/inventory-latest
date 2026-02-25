import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.ts';

export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyAccessToken(token) as { userId: string };
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
