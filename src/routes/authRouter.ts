import express from 'express';
import { checkForAuthentication, getUser, login, register, verifyEmail } from '../controllers/auth/authController';
import authMiddleware from '../middlewares/authMiddleware';
import refreshToken from '../controllers/auth/tokenController';
const router = express.Router();

router.post('/register', register)
router.get('/verify-email', verifyEmail)
router.post('/login', login)
router.get("/get-user", authMiddleware, getUser)
router.post("/refresh-token", refreshToken)
router.post("/check", authMiddleware, checkForAuthentication)

export default router;
