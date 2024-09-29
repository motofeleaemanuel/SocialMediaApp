import { NextFunction, Response } from "express";
import User from "../models/user";
import { verifyAccessToken } from "../utils/jwt";
import { AuthRequest } from "../types/AuthRequest";


const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded: any = verifyAccessToken(token);
        console.log(decoded)
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { email } = decoded;

        const user: any = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!user.isVerified) {
            return res.status(401).json({ message: "This email is not verified" });
        }

        // Initialize req.user if it doesn't exist
        req.user = {
            id: user._id.toString(),
            isVerified: user.isVerified,
            email: email
        };
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Something went wrong...",
        });
    }
};

export default authMiddleware;