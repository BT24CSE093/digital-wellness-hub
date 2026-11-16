import { User, RefreshToken, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class AuthRepository {
  /**
   * Find a user by email address (case-insensitive search).
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Find a user by unique ID.
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new user record with STUDENT role by default.
   */
  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? UserRole.STUDENT,
        isActive: true,
      },
    });
  }

  /**
   * Persists a SHA-256 hashed refresh token in PostgreSQL.
   */
  async createRefreshToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Finds a refresh token by its SHA-256 hash, including associated User.
   */
  async findRefreshTokenByHash(
    tokenHash: string
  ): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  /**
   * Marks a specific refresh token as revoked.
   */
  async revokeRefreshToken(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes all active refresh tokens for a user.
   * Triggered when token reuse is detected (compromise recovery).
   */
  async revokeAllUserTokens(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Atomically rotates a refresh token within a PostgreSQL transaction:
   * 1. Marks the old token as revoked.
   * 2. Inserts the newly generated token hash.
   */
  async rotateRefreshToken(data: {
    oldTokenId: string;
    newTokenHash: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return prisma.$transaction(async (tx) => {
      // 1. Revoke the presented token
      await tx.refreshToken.update({
        where: { id: data.oldTokenId },
        data: { revokedAt: new Date() },
      });

      // 2. Create the new token in the active chain
      return tx.refreshToken.create({
        data: {
          tokenHash: data.newTokenHash,
          userId: data.userId,
          expiresAt: data.expiresAt,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    });
  }
}

export const authRepository = new AuthRepository();
