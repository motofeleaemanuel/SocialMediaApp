import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import User from "../../models/user";
import { bucket } from "../..";
import { v4 as uuidv4 } from 'uuid';

export const getUserProfileById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "No user id provided" })
    try {
        const user = await User.findById(id).populate({
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
                            path: 'replies',
                            populate: {
                                path: 'user',
                                select: 'firstName lastName avatar'
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
        })
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();
        return res.status(200).json({ ...userWithoutSensitiveData, posts: user.posts });

    } catch (err) {
        console.error("Error:", err)
        return res.status(500).json({ message: "Server error" })
    }
}

export const getUsers = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });
    const searchTerm = req.query.search || '';

    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } }
            ]
        }).select('_id firstName lastName avatar');;

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // If an avatar image is provided in the request, handle the file upload
        if (req.file) {
            const avatarFile = req.file;
            const uniqueFileName = `${uuidv4()}-${avatarFile.originalname}`;
            const blob = bucket.file(uniqueFileName);

            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: avatarFile.mimetype, // Ensure correct MIME type is set
                }
            });

            blobStream.on('error', (err) => {
                console.error('File upload error:', err);
                return res.status(500).json({ message: 'Avatar upload failed' });
            });

            blobStream.on('finish', async () => {
                try {
                    await blob.makePublic();
                    const avatarUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                    // Update the user's avatar in the database
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: userId },
                        { $set: { avatar: avatarUrl } },
                        { new: true, runValidators: true }
                    );

                    if (!updatedUser) {
                        return res.status(404).json({ message: 'User not found' });
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
                        return res.status(404).json({ message: 'User not found' });
                    }

                    if (user.posts) {
                        user.posts.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                    }

                    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();

                    return res.status(200).json({ user: { ...userWithoutSensitiveData, posts: user.posts } });
                } catch (err) {
                    console.error('Error making file public:', err);
                    return res.status(500).json({ message: 'Failed to generate public URL for avatar' });
                }
            });

            blobStream.end(avatarFile.buffer);
        } else {
            return res.status(400).json({ message: 'No avatar image provided' });
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};