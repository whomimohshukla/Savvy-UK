import { Router } from 'express';
import {
  register, login, refresh, logout, getMe,
  changePassword, forgotPassword, resetPassword, deleteAccount,
} from '../controllers/auth/auth.controller';
import { googleAuth } from '../controllers/auth/google.controller';
import { updateProfile } from '../controllers/auth/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validators';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts, try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register',         authLimiter, validate(registerSchema),        register);
router.post('/login',            authLimiter, validate(loginSchema),            login);
router.post('/google',           authLimiter,                                   googleAuth);
router.post('/refresh',                                                          refresh);
router.post('/forgot-password',  authLimiter, validate(forgotPasswordSchema),   forgotPassword);
router.post('/reset-password',               validate(resetPasswordSchema),     resetPassword);

router.post('/logout',           authenticate,                                  logout);
router.get('/me',                authenticate,                                  getMe);
router.patch('/profile',         authenticate,                                  updateProfile);
router.patch('/change-password', authenticate, validate(changePasswordSchema),  changePassword);
router.delete('/account',        authenticate,                                  deleteAccount);

export default router;
