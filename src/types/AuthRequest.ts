import { Request } from 'express';

export interface AuthRequest<T = any> extends Request {
    user?: {
        id: string;
        isVerified: boolean;
        email: string;
    };
    body: T;
}