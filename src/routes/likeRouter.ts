// routes/commentRoutes.ts
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { likeComment, likePost } from "../controllers/post/like/likeController";

const router = Router();

router.post("/:id", authMiddleware, likePost);
router.post('/comment/:commentId', authMiddleware, likeComment);

export default router;