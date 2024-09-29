import bcrypt from 'bcrypt';
import User from '../../models/user';
import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken, generateVerificationToken, verifyAccountVerificationToken } from '../../utils/jwt';
import { MailerSend, Recipient, EmailParams, Sender } from 'mailersend';
import { AuthRequest } from '../../types/AuthRequest';


export const register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken(email);
        console.log(verificationToken)
        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        await newUser.save();

        const verificationLink = `http://localhost:4200/verify-email?token=${verificationToken}`;
        const mailerSend = new MailerSend({
            apiKey: process.env.MAILER_SEND_API_KEY || "",
        });

        const sender = new Sender("no-reply@trial-o65qngkzyk8gwr12.mlsender.net", "Email Verification");
        const recipients = [new Recipient(email, "Recipient")];

        const emailParams = new EmailParams({
            from: sender,
            to: recipients,
            subject: "Verify your email",
            personalization: [
                {
                    email: email,
                    data: {
                        name: `${firstName} ${lastName}`,
                        action_url: verificationLink,
                        account_name: 'EM-Tech SRL'
                    }
                }
            ]
        }).setTemplateId("neqvygmk3yz40p7w")

        await mailerSend.email.send(emailParams);

        res.status(201).json({ message: 'User registered, please check your email for verification.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email })
            .populate({
                path: 'posts',
                populate: [
                    {
                        path: 'comments',
                        populate: [
                            {
                                path: 'user',
                                select: 'firstName lastName avatar'
                            },
                            {
                                path: 'replies',  // Populate replies
                                populate: {
                                    path: 'user',
                                    select: 'firstName lastName avatar'  // Populate user for replies
                                }
                            }
                        ]
                    },
                    {
                        path: 'user',
                        select: 'firstName lastName avatar',
                    },
                    {
                        path: 'likes',
                        select: 'firstName lastName avatar',
                    }
                ]
            }).populate({
                path: 'friends',
                select: 'firstName lastName avatar'
            }).populate({
                path: 'friendRequests',
                select: 'firstName lastName avatar'
            })
            .exec();
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        if (user && user.posts) {
            user.posts.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken.push(refreshToken);

        await user.save();

        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();

        return res.status(200).json({
            user: { ...userWithoutSensitiveData, posts: user.posts },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: "Error logging in" });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (typeof token !== 'string' || !token) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    try {
        const decoded: any = verifyAccountVerificationToken(token);

        if (!decoded) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: 'Email is already verified' });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.find({ email: "motofeleaionel@yahoo.com" })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ user })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}


export const checkForAuthentication = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(userId)
            .populate({
                path: 'posts',
                populate: [
                    {
                        path: 'comments',
                        populate: [
                            {
                                path: 'user',
                                select: 'firstName lastName avatar'
                            },
                            {
                                path: 'replies',  // Populate replies
                                populate: {
                                    path: 'user',
                                    select: 'firstName lastName avatar'  // Populate user for replies
                                }
                            }
                        ]
                    },
                    {
                        path: 'user',
                        select: 'firstName lastName avatar',
                    },
                    {
                        path: 'likes',
                        select: 'firstName lastName avatar',
                    },
                ]
            }).populate({
                path: 'friends',
                select: 'firstName lastName avatar'
            }).populate({
                path: 'friendRequests',
                select: 'firstName lastName avatar'
            })
            .exec();
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (user && user.posts) {
            user.posts.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        }


        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();

        return res.status(200).json({ user: { ...userWithoutSensitiveData, posts: user.posts } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};