import { Request, Response } from "express";
import Comment from "../../../models/comment";
import { AuthRequest } from "../../../types/AuthRequest";
import { AddCommentRequestBody } from "../../../types/ReqBody";
import Post from "../../../models/post";

export const createComment = async (req: AuthRequest<AddCommentRequestBody>, res: Response) => {
    const { postId, text, parentId } = req.body;
    const userId = req.user?.id;

    try {
        // Ensure the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create a new comment or reply
        const newComment = new Comment({
            user: userId,
            text,
            post: postId,
            parentComment: parentId || null,  // If no parentId, treat as top-level comment
        });

        const savedComment = await newComment.save();

        // If parentId is not present, treat it as a top-level comment
        if (!parentId) {
            // Add new top-level comment to the post
            await Post.findByIdAndUpdate(postId, {
                $push: { comments: savedComment._id }
            });
        } else {
            // If parentId is present, treat it as a reply to the parent comment
            await Comment.findByIdAndUpdate(parentId, {
                $push: { replies: savedComment._id }
            });
        }

        // Fetch the comment with all replies and user data populated
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('user', 'firstName lastName avatar')  // Populate user fields
            .populate({
                path: 'replies',  // Populate replies
                populate: {
                    path: 'user',  // Populate user fields within replies
                    select: 'firstName lastName avatar'
                }
            });

        // Check if populatedComment is not null
        if (populatedComment) {
            // Add type property to the response
            const responseComment = {
                ...populatedComment.toObject(), // Convert Mongoose document to plain object
                type: parentId ? 'reply' : 'comment' // Determine type based on presence of parentId
            };

            return res.status(201).json(responseComment);
        } else {
            return res.status(500).json({ message: "Error fetching the saved comment" });
        }
    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCommentsForPost = async (req: Request, res: Response) => {
    const postId = req.params.postId;

    try {
        const comments = await Comment.find({ post: postId })
            .populate("user", "firstName lastName avatar")
            .populate({
                path: "replies",
                populate: {
                    path: "user",
                    select: "firstName lastName avatar"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    const commentId = req.params.commentId;
    const { text } = req.body;

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { text },
            { new: true, runValidators: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error("Error updating comment:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateReply = async (req: Request, res: Response) => {
    const replyId = req.params.replyId;
    const { text } = req.body;

    try {
        const updatedReply = await Comment.findByIdAndUpdate(
            replyId,
            { text },
            { new: true, runValidators: true }
        );

        if (!updatedReply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        return res.status(200).json(updatedReply);
    } catch (error) {
        console.error("Error updating reply:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    const commentId = req.params.commentId;

    try {
        const commentToDelete = await Comment.findById(commentId).populate('replies');

        if (!commentToDelete) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (commentToDelete.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: commentToDelete.replies } });
        }

        await Comment.findByIdAndDelete(commentId);

        await Post.findByIdAndUpdate(commentToDelete.post, {
            $pull: { comments: commentId }
        });

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteReply = async (req: Request, res: Response) => {
    const replyId = req.params.replyId;

    try {
        const replyToDelete = await Comment.findById(replyId);

        if (!replyToDelete) {
            return res.status(404).json({ message: "Reply not found" });
        }

        const parentComment = await Comment.findOne({ replies: replyId });

        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment._id, {
                $pull: { replies: replyId }
            });
        }

        await Comment.findByIdAndDelete(replyId);

        return res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
        console.error("Error deleting reply:", error);
        return res.status(500).json({ message: "Server error" });
    }
};