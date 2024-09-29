import { Response } from "express";
import { AuthRequest } from "../../../types/AuthRequest";
import User from "../../../models/user";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const requesterId = req.user?.id;

    if (!requesterId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (requesterId === userId) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    try {
        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({ message: "User not found" });
        }


        if (user.friendRequests.includes(requesterId as any)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        if (user.friends.includes(requesterId as any)) {
            return res.status(400).json({ message: "Already friends" });
        }

        user.friendRequests.push(requesterId as any);
        await user.save();

        return res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const requesterId = req.user?.id;

    if (!requesterId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const sender = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!sender || !requester) {
            return res.status(404).json({ message: "User not found" });
        }

        const senderIdStr = userId.toString();
        const requesterIdStr = requesterId.toString();

        const userFriendRequests = requester.friendRequests.map(id => id.toString());
        if (!userFriendRequests.includes(senderIdStr)) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        requester.friends.push(senderIdStr as any);
        requester.friendRequests = requester.friendRequests.filter(id => id.toString() !== senderIdStr);
        await requester.save();

        sender.friends.push(requesterIdStr as any);
        await sender.save();

        return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const requesterId = req.user?.id;

    if (!requesterId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const sender = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!sender || !requester) {
            return res.status(404).json({ message: "User not found" });
        }

        const senderIdStr = userId.toString();

        if (!requester.friendRequests.includes(senderIdStr as any)) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        requester.friendRequests = requester.friendRequests.filter(id => id.toString() !== senderIdStr);
        await requester.save();

        return res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
    const { friendId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save();

        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        await friend.save();

        return res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Error removing friend:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getFriendsById = async (req: AuthRequest, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(401).json({ message: "No id provided" });
    }

    try {
        const user = await User.findById(userId).populate("friends", "firstName lastName avatar");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error retrieving friends:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await User.findById(userId).populate("friends", "firstName lastName avatar");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error retrieving friends:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await User.findById(userId).populate("friendRequests", "firstName lastName avatar");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.friendRequests);
    } catch (error) {
        console.error("Error retrieving friend requests:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
