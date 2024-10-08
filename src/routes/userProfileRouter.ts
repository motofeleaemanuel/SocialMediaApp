import express from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { getUserProfileById, getUsers, updateAvatar, updateCover } from '../controllers/user/userProfileController';
import upload from '../middlewares/multerMiddleware';


const router = express.Router();

router.get('/:id', authMiddleware, getUserProfileById)
router.get('/', authMiddleware, getUsers)
router.post('/update-avatar', authMiddleware, upload.single('avatar'), updateAvatar)
router.post('/update-cover', authMiddleware, upload.single('cover'), updateCover)





export default router;
