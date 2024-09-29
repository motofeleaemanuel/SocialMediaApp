import express from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { updateSettings } from '../controllers/user/settingsController';
import upload from '../middlewares/multerMiddleware';

const router = express.Router();

// router.patch('/', authMiddleware, upload.single('avatar'), updateSettings)
router.patch('/', authMiddleware, updateSettings)


export default router;
