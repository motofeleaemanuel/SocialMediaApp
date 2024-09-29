// /routes/post/postRoutes.ts
import { Router } from "express";
import { createPost, getPostsByUser, getPostsForFeed } from "../controllers/post/postController";
import authMiddleware from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

router.get("/feed", authMiddleware, getPostsForFeed)
router.get("/:id", authMiddleware, getPostsByUser);
router.post("/", authMiddleware, upload.single('photo'), createPost);

export default router;