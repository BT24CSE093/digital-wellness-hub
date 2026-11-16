import { Router } from 'express';
import { guidesController } from './guides.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { guideQuerySchema, guideSlugParamSchema } from './guides.validation';

export const guideRoutes = Router();

guideRoutes.get('/', validateRequest(guideQuerySchema), guidesController.listGuides);
guideRoutes.get('/:slug', validateRequest(guideSlugParamSchema), guidesController.getGuideBySlug);
