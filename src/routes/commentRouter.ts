// routes/commentRoutes.ts
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { createComment, deleteComment, deleteReply, getCommentsForPost, updateComment, updateReply } from "../controllers/post/comment/commentController";

const router = Router();

router.post("/", authMiddleware, createComment);
router.get("/:postId", authMiddleware, getCommentsForPost);
router.put("/:commentId", authMiddleware, updateComment);
router.put("/reply/:replyId", authMiddleware, updateReply);
router.delete("/:commentId", authMiddleware, deleteComment);
router.delete("/reply/:replyId", authMiddleware, deleteReply);

export default router;