import { User } from '@prisma/client';
import { authRepository, AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput, SafeUser, AuthTokens } from './auth.types';
import { hashPassword, verifyPassword } from '../../utils/password.util';
import {
  signAccessToken,
  generateRandomToken,
  hashToken,
} from '../../utils/jwt.util';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  /**
   * Helper to strip sensitive fields (password hash, tokens) from user entity.
   */
  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Registers a new student account.
   */
  async register(
    input: RegisterInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Duplicate email prevention
    const existingUser = await this.repo.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(
        409,
        'EMAIL_ALREADY_EXISTS',
        'An account with this email address already exists.'
      );
    }

    // 2. Argon2id password hashing
    const passwordHash = await hashPassword(input.password);

    // 3. Create user
    const newUser = await this.repo.createUser({
      email: normalizedEmail,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    });

    // 4. Issue dual tokens
    const accessToken = signAccessToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.repo.createRefreshToken({
      tokenHash,
      userId: newUser.id,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
      user: this.toSafeUser(newUser),
    };
  }

  /**
   * Authenticates user credentials and issues tokens.
   */
  async login(
    input: LoginInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Fetch user by email
    const user = await this.repo.findUserByEmail(normalizedEmail);
    if (!user) {
      // Generic error message to prevent account enumeration
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Invalid email or password.'
      );
    }

    // 2. Check account status
    if (!user.isActive) {
      throw new AppError(
        403,
        'ACCOUNT_DEACTIVATED',
        'This account has been deactivated. Please contact support.'
      );
    }

    // 3. Argon2id password verification
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      // Generic error message to prevent account enumeration
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Invalid email or password.'
      );
    }

    // 4. Issue dual tokens
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.repo.createRefreshToken({
      tokenHash,
      userId: user.id,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
      user: this.toSafeUser(user),
    };
  }

  /**
   * Rotates a single-use refresh token and detects token reuse attacks.
   */
  async refresh(
    rawRefreshToken: string | undefined,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    if (!rawRefreshToken) {
      throw new AppError(
        401,
        'REFRESH_TOKEN_REQUIRED',
        'Refresh token cookie is required.'
      );
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);

    // 1. Check for token reuse (replay attack)
    if (storedToken && storedToken.revokedAt !== null) {
      console.warn(
        `[Security Alert] Refresh token reuse detected for userId: ${storedToken.userId}. Revoking entire token family.`
      );
      // Revoke all tokens for this user immediately (compromise recovery)
      await this.repo.revokeAllUserTokens(storedToken.userId);

      throw new AppError(
        401,
        'TOKEN_REUSE_DETECTED',
        'Security violation detected: token reuse. All active sessions have been terminated. Please log in again.'
      );
    }

    if (!storedToken) {
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Invalid or unrecognized refresh token.'
      );
    }

    // 2. Check token expiration
    if (new Date() > storedToken.expiresAt) {
      await this.repo.revokeRefreshToken(storedToken.id);
      throw new AppError(
        401,
        'REFRESH_TOKEN_EXPIRED',
        'Session has expired. Please log in again.'
      );
    }

    // 3. Verify user active state
    if (!storedToken.user.isActive) {
      throw new AppError(
        403,
        'ACCOUNT_DEACTIVATED',
        'Account is deactivated.'
      );
    }

    // 4. Token rotation: revoke old token and insert new token inside an atomic transaction
    const newRawRefreshToken = generateRandomToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.repo.rotateRefreshToken({
      oldTokenId: storedToken.id,
      newTokenHash,
      userId: storedToken.userId,
      expiresAt: newExpiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    // 5. Issue new Access Token
    const accessToken = signAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: newRawRefreshToken,
      },
      user: this.toSafeUser(storedToken.user),
    };
  }

  /**
   * Logs out the user by revoking their current refresh token.
   */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    try {
      const tokenHash = hashToken(rawRefreshToken);
      const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);
      if (storedToken && storedToken.revokedAt === null) {
        await this.repo.revokeRefreshToken(storedToken.id);
      }
    } catch (err) {
      console.error('[Auth] Error revoking token during logout:', err);
    }
  }

  /**
   * Retrieves profile for currently authenticated user.
   */
  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User profile not found.');
    }
    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'Account is deactivated.');
    }
    return this.toSafeUser(user);
  }
}

export const authService = new AuthService();
