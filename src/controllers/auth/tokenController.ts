import { Request, Response } from "express";
import { generateAccessToken, verifyRefreshToken } from "../../utils/jwt";
import User from "../../models/user";

const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded: any = verifyRefreshToken(refreshToken)
        if (!decoded) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user || !user.refreshToken.includes(refreshToken)) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Error refreshing the token:', error);
        return res.status(500).json({ message: "Error refreshing the token" });
    }
};

export default refreshToken;