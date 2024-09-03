export interface AuthRequest extends Request {
    user?: {
        id: string;
        isVerified: boolean;
        email: string;
    }
}