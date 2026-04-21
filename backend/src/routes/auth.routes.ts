import { Router } from 'express';
import { register, login, refresh, logout, getMe, changePassword, forgotPassword, resetPassword, deleteAccount } from '../controllers/auth/auth.controller';
import { googleAuth } from '../controllers/auth/google.controller';
import { updateProfile } from '../controllers/auth/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const router = Router();

router.post('/register',  authLimiter, register);
router.post('/login',     authLimiter, login);
router.post('/google',    authLimiter, googleAuth);
router.post('/refresh',          refresh);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.post('/logout',    authenticate, logout);
router.get('/me',         authenticate, getMe);
router.patch('/profile',         authenticate, updateProfile);
router.patch('/change-password', authenticate, changePassword);
router.delete('/account',        authenticate, deleteAccount);

export default router;
