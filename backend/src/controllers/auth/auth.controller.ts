import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { cacheDel, CacheKeys } from '../../config/redis';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordChangedEmail, sendPasswordResetEmail, sendAccountDeletedEmail } from '../../services/email/email.service';

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}

// POST /api/v1/auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, postcode } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        postcode: postcode?.toUpperCase(),
        userProfile: { create: {} },
      },
      select: { id: true, email: true, name: true, plan: true, onboardingDone: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name ?? '').catch(() => {});

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, name: true, plan: true,
        passwordHash: true, onboardingDone: true,
      },
    });

    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Verify
    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    // Rotate tokens
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      stored.user.id,
      stored.user.email
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: stored.user.id, expiresAt },
    });

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    // Clear cache
    const userId = (req as any).userId;
    if (userId) {
      await cacheDel(CacheKeys.userDashboard(userId));
      await cacheDel(CacheKeys.userBenefits(userId));
    }

    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/auth/change-password
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required', 400);
    }
    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user || !user.passwordHash) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { email: true, name: true },
    });

    // Invalidate all refresh tokens so other sessions are logged out
    await prisma.refreshToken.deleteMany({ where: { userId } });

    // Notify user by email (non-blocking)
    sendPasswordChangedEmail(updatedUser.email, updatedUser.name ?? '').catch(() => {});

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/auth/me
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, postcode: true,
        plan: true, onboardingDone: true, householdSize: true,
        createdAt: true, userProfile: true,
      },
    });

    if (!user) throw new AppError('User not found', 404);

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/forgot-password
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    // Always respond with success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });

    if (user) {
      // Delete any existing tokens for this user
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      // Create new token (expires in 1 hour)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, user.name ?? '', resetUrl);
    }

    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/reset-password
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw new AppError('Token and password are required', 400);
    if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new AppError('This reset link is invalid or has expired. Please request a new one.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
      prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    sendPasswordChangedEmail(resetToken.user.email, resetToken.user.name ?? '').catch(() => {});

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/auth/account
export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, passwordHash: true, googleId: true },
    });
    if (!user) throw new AppError('User not found', 404);

    // Require password confirmation for non-Google accounts
    if (!user.googleId) {
      if (!password) throw new AppError('Password is required to delete your account', 400);
      const isValid = await bcrypt.compare(password, user.passwordHash ?? '');
      if (!isValid) throw new AppError('Incorrect password', 400);
    }

    // Delete in correct order (cascades handle most, but explicit for safety)
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.alert.deleteMany({ where: { userId } });
    await prisma.saving.deleteMany({ where: { userId } });
    await prisma.energyScan.deleteMany({ where: { userId } });
    await prisma.bill.deleteMany({ where: { userId } });
    await prisma.benefitsCheck.deleteMany({ where: { userId } });
    await prisma.userProfile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    // Clear cache
    await cacheDel(CacheKeys.userDashboard(userId));
    await cacheDel(CacheKeys.userBenefits(userId));

    // Send farewell email (non-blocking)
    sendAccountDeletedEmail(user.email, user.name ?? '').catch(() => {});

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
}
