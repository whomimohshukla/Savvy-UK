import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { cacheDel, CacheKeys } from '../../config/redis';

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
