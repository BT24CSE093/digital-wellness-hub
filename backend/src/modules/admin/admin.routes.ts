import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { adminController } from './admin.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from '../resources/resources.validation';
import {
  guideQuerySchema,
  createGuideSchema,
  updateGuideSchema,
  guideIdParamSchema,
} from '../guides/guides.validation';
import { verifyResourceSchema, publishGuideSchema } from './admin.validation';

export const adminRoutes = Router();

// Apply auth + admin role check to all admin routes
adminRoutes.use(authenticateToken);
adminRoutes.use(requireRole([UserRole.ADMIN]));

// Resources
adminRoutes.post('/resources', validateRequest(createResourceSchema), adminController.createResource);
adminRoutes.put('/resources/:id', validateRequest(updateResourceSchema), adminController.updateResource);
adminRoutes.delete('/resources/:id', validateRequest(resourceIdParamSchema), adminController.deleteResource);
adminRoutes.patch('/resources/:id/verify', validateRequest(verifyResourceSchema), adminController.verifyResource);

// Categories
adminRoutes.post('/categories', validateRequest(createCategorySchema), adminController.createCategory);
adminRoutes.put('/categories/:id', validateRequest(updateCategorySchema), adminController.updateCategory);
adminRoutes.delete('/categories/:id', validateRequest(categoryIdParamSchema), adminController.deleteCategory);

// Guides
adminRoutes.get('/guides', validateRequest(guideQuerySchema), adminController.listGuides);
adminRoutes.post('/guides', validateRequest(createGuideSchema), adminController.createGuide);
adminRoutes.put('/guides/:id', validateRequest(updateGuideSchema), adminController.updateGuide);
adminRoutes.delete('/guides/:id', validateRequest(guideIdParamSchema), adminController.deleteGuide);
adminRoutes.patch('/guides/:id/publish', validateRequest(publishGuideSchema), adminController.publishGuide);
