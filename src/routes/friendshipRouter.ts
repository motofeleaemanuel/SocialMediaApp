import express from "express";
import { acceptFriendRequest, sendFriendRequest, rejectFriendRequest, removeFriend, getFriends, getFriendRequests, getFriendsById } from "../controllers/user/friends/friendshipController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/send-request/:userId", authMiddleware, sendFriendRequest);
router.post("/accept-request/:userId", authMiddleware, acceptFriendRequest);
router.post("/reject-request/:userId", authMiddleware, rejectFriendRequest);
router.delete("/:friendId", authMiddleware, removeFriend);
router.get("/:id", authMiddleware, getFriendsById);
router.get("/", authMiddleware, getFriends);
router.get("/friend-requests", authMiddleware, getFriendRequests);

export default router;