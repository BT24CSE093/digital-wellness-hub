import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';
import {
  REFRESH_COOKIE_NAME,
  getRefreshTokenCookieOptions,
  getClearRefreshTokenCookieOptions,
} from '../../utils/cookie.util';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.register(req.body, metadata);

      // Set single-use refresh token in secure HttpOnly cookie
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.tokens.refreshToken,
        getRefreshTokenCookieOptions()
      );

      sendSuccess({
        res,
        statusCode: 201,
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.login(req.body, metadata);

      // Set single-use refresh token in secure HttpOnly cookie
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.tokens.refreshToken,
        getRefreshTokenCookieOptions()
      );

      sendSuccess({
        res,
        statusCode: 200,
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Rotates refresh token and returns new access token.
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.refresh(rawRefreshToken, metadata);

      // Set new rotated refresh token in secure HttpOnly cookie
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.tokens.refreshToken,
        getRefreshTokenCookieOptions()
      );

      sendSuccess({
        res,
        statusCode: 200,
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      // If refresh fails due to reuse or invalid token, clear the cookie
      res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshTokenCookieOptions());
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      await authService.logout(rawRefreshToken);

      res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshTokenCookieOptions());

      sendSuccess({
        res,
        statusCode: 200,
        data: {
          message: 'Logged out successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const user = await authService.getCurrentUser(userId);

      sendSuccess({
        res,
        statusCode: 200,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
