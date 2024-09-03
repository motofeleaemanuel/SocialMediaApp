import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const accountVerificationSecret = process.env.ACCOUNT_VERIFICATION_TOKEN_SECRET || "verify_secret"

export const generateAccessToken = (userData: any) => {
    const { email } = userData;
    return jwt.sign({ email }, accessTokenSecret, { expiresIn: "1h" });
};

export const generateRefreshToken = (userData: any) => {
    const { email } = userData;
    return jwt.sign({ email }, refreshTokenSecret, { expiresIn: "15d" });
};

export const generateVerificationToken = (email: string) => {
    return jwt.sign({ email }, accountVerificationSecret, { expiresIn: '15m' });
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, accessTokenSecret);
    } catch (e) {
        return null
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, refreshTokenSecret);
    } catch (e) {
        return null
    }
};

export const verifyAccountVerificationToken = (token: string) => {
    try {
        console.log(token)
        return jwt.verify(token, accountVerificationSecret);
    } catch (e) {
        return null;
    }
};