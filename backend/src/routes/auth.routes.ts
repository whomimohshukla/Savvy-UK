import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth/auth.controller';
import { googleAuth } from '../controllers/auth/google.controller';
import { updateProfile } from '../controllers/auth/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const router = Router();

router.post('/register',  authLimiter, register);
router.post('/login',     authLimiter, login);
router.post('/google',    authLimiter, googleAuth);
router.post('/refresh',   refresh);
router.post('/logout',    authenticate, logout);
router.get('/me',         authenticate, getMe);
router.patch('/profile',  authenticate, updateProfile);

export default router;
