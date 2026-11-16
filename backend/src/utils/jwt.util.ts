import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { TokenPayload } from '../modules/auth/auth.types';

const ISSUER = 'digital-wellness-hub';
const AUDIENCE = 'digital-wellness-hub-client';

/**
 * Signs a short-lived (15 min) JWT Access Token.
 * Payload restricted to sub (userId), email, and role.
 */
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
      issuer: ISSUER,
      audience: AUDIENCE,
    }
  );
}

/**
 * Verifies a JWT Access Token signature, issuer, audience, and expiration.
 * Throws an error if invalid or expired.
 */
export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as jwt.JwtPayload;

  if (!decoded.sub || !decoded.email || !decoded.role) {
    throw new Error('Malformed token claims.');
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

/**
 * Generates a 64-character cryptographically secure random string (32 bytes entropy)
 * used as the raw single-use refresh token sent to the client.
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes the SHA-256 hash of a raw token string for safe database persistence.
 * If database dumps are compromised, raw refresh tokens cannot be weaponized.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
