import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { logger } from '../../config/logger';
import { sendWelcomeEmail } from '../../services/email/email.service';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

/**
 * POST /api/v1/auth/google
 * Receives the Google ID token from the frontend after Google Sign-In
 * and returns our own JWT tokens.
 */
export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new AppError('Google ID token is required', 400);

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new AppError('Invalid Google token', 401);

    const { email, name, picture, sub: googleId } = payload;
    if (!email) throw new AppError('Google account has no email', 400);

    logger.info(`Google OAuth: ${email}`);

    // Upsert user — create if new, update Google ID if existing
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Existing user — update google fields if needed
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: picture ?? undefined },
        });
      }
    } else {
      // New user — create account (no password needed for Google users)
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? email.split('@')[0],
          passwordHash: '', // Google users don't use password login
          googleId,
          avatarUrl: picture ?? undefined,
          emailVerified: true, // Google already verified the email
          userProfile: { create: {} },
        },
      });
      logger.info(`New user via Google OAuth: ${email}`);
      sendWelcomeEmail(email, name ?? email).catch(() => {});
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const { passwordHash: _, ...safeUser } = user as any;

    res.json({
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
        isNewUser: !user.onboardingDone,
      },
    });
  } catch (error) {
    next(error);
  }
}
