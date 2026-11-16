import { Router } from 'express';
import { authController } from './auth.controller';
import { registerSchema, loginSchema } from './auth.validation';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import { validateCsrfOrigin } from '../../middleware/csrf.middleware';

const router = Router();

// Public Authentication Endpoints
router.post(
  '/register',
  authRateLimiter,
  validateCsrfOrigin,
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  validateCsrfOrigin,
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  authRateLimiter,
  validateCsrfOrigin,
  authController.refresh.bind(authController)
);

router.post(
  '/logout',
  validateCsrfOrigin,
  authController.logout.bind(authController)
);

// Protected Authentication Profile
router.get(
  '/me',
  authenticateToken,
  authController.getMe.bind(authController)
);

export const authRoutes = router;
