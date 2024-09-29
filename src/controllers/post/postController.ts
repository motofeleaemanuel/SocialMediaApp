import { Request, Response } from "express";
import Post from "../../models/post";
import { uploadFileToFirebase } from "../../services/firebaseStorageService";
import { AuthRequest } from "../../types/AuthRequest";
import { CreatePostRequestBody } from "../../types/ReqBody";
import User from "../../models/user";

export const createPost = async (req: AuthRequest<CreatePostRequestBody>, res: Response) => {
    const { description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        let photoUrl = "";
        if (req.file) {
            try {
                photoUrl = await uploadFileToFirebase(req.file, userId);
            } catch (err: any) {
                return res.status(500).json({ message: err.message });
            }
        }

        const newPost = new Post({
            user: userId,
            description,
            photo: photoUrl,
        });

        const savedPost = await newPost.save();

        const populatedPost = await Post.findById(savedPost._id)
            .populate({
                path: 'user',
                select: 'firstName lastName avatar',
            })
            .exec();

        await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

        return res.status(201).json(populatedPost);
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getPostsByUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    try {
        let dateFilter: any = {};

        if (typeof startDate === 'string') {
            const parsedStartDate = new Date(startDate);
            if (!isNaN(parsedStartDate.getTime())) {
                dateFilter.createdAt = { ...dateFilter.createdAt, $gte: parsedStartDate };
            }
        }

        if (typeof endDate === 'string') {
            const parsedEndDate = new Date(endDate);
            if (!isNaN(parsedEndDate.getTime())) {
                dateFilter.createdAt = { ...dateFilter.createdAt, $lte: parsedEndDate };
            }
        }

        console.log(dateFilter, "df");

        const user = await User.findById(id).populate({
            path: 'posts',
            match: Object.keys(dateFilter).length ? dateFilter : undefined,
            populate: {
                path: 'user',
                select: 'firstName lastName avatar'
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = user.posts.sort((a: any, b: any) => b.createdAt - a.createdAt);

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts by user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getPostsForFeed = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    try {
        const user = await User.findById(userId).populate("friends posts");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendIds = user.friends.map((friend: any) => friend._id);

        let dateFilter: { $gte?: Date; $lte?: Date } = {};

        if (typeof startDate === 'string') {
            const parsedStartDate = new Date(startDate);
            if (!isNaN(parsedStartDate.getTime())) {
                dateFilter.$gte = parsedStartDate;
            }
        }

        if (typeof endDate === 'string') {
            const parsedEndDate = new Date(endDate);
            if (!isNaN(parsedEndDate.getTime())) {
                dateFilter.$lte = parsedEndDate;
            }
        }
        const friendPostsQuery = {
            user: { $in: friendIds },
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        };

        const friendPosts = await Post.find(friendPostsQuery)
            .populate("user", "firstName lastName avatar")
            .sort({ createdAt: -1 });

        const userPostsQuery = {
            user: userId,
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        };

        const userPosts = await Post.find(userPostsQuery)
            .populate("user", "firstName lastName avatar")
            .sort({ createdAt: -1 });

        const allPosts = [...friendPosts, ...userPosts]
            .sort((a: any, b: any) => b.createdAt - a.createdAt);

        return res.status(200).json(allPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ message: "Server error" });
    }
};