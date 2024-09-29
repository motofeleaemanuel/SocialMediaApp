import { Response } from "express";
import Post from "../../../models/post";
import { AuthRequest } from "../../../types/AuthRequest";
import mongoose from "mongoose";
import Comment from "../../../models/comment";

export const likePost = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        let post = await Post.findById(id).populate({
            path: 'likes',
            select: 'firstName lastName avatar'
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const hasLiked = post.likes.some((likeUser: any) => likeUser._id.toString() === userObjectId.toString());

        if (hasLiked) {
            post.likes = post.likes.filter((likeUser: any) => likeUser._id.toString() !== userObjectId.toString());
        } else {
            post.likes.push(userObjectId as any);
        }

        await post.save();
        post = await Post.findById(id).populate([
            {
                path: 'likes',
                select: 'firstName lastName avatar'
            },
            {
                path: 'user',
                select: 'firstName lastName avatar'
            }
        ]);

        return res.status(200).json({
            message: hasLiked ? "Like removed successfully" : "Post liked successfully",
            post
        });
    } catch (error) {
        console.error("Error toggling like on post:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const likeComment = async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params; // Assuming commentId is passed as a URL parameter
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find the comment or reply by ID
        let comment = await Comment.findById(commentId)
            .populate({
                path: 'likes',
                select: 'firstName lastName avatar'
            })
            .populate({
                path: 'replies',
                populate: {
                    path: 'user likes', // Populate user and likes in each reply
                    select: 'firstName lastName avatar'
                }
            });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user has already liked the comment
        const hasLiked = comment.likes.some((likeUser: any) => likeUser._id.toString() === userObjectId.toString());

        if (hasLiked) {
            // Unlike the comment: use Mongoose's `pull` method to remove the user's ObjectId
            comment.likes.pull(userObjectId);
        } else {
            // Like the comment: use Mongoose's `push` method to add the user's ObjectId
            comment.likes.push(userObjectId);
        }

        // Save the comment
        await comment.save();

        // Fetch the updated comment with the user details of those who liked it
        comment = await Comment.findById(commentId).populate({
            path: 'likes',
            select: 'firstName lastName avatar'
        });

        return res.status(200).json({
            message: hasLiked ? "Like removed successfully" : "Comment liked successfully",
            comment
        });
    } catch (error) {
        console.error("Error toggling like on comment:", error);
        return res.status(500).json({ message: "Server error" });
    }
};