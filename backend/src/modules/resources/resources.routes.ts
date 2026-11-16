import { Router } from 'express';
import { resourcesController } from './resources.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  resourceQuerySchema,
  resourceIdParamSchema,
  categoryIdParamSchema,
} from './resources.validation';

export const resourceRoutes = Router();
export const categoryRoutes = Router();

// Resource routes
resourceRoutes.get('/', validateRequest(resourceQuerySchema), resourcesController.listResources);
resourceRoutes.get('/categories', resourcesController.listCategories);
resourceRoutes.get('/:id', validateRequest(resourceIdParamSchema), resourcesController.getResource);

// Standalone Category routes for /api/v1/categories
categoryRoutes.get('/', resourcesController.listCategories);
categoryRoutes.get('/:id', validateRequest(categoryIdParamSchema), resourcesController.getCategory);
