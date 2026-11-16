import { Request, Response, NextFunction } from 'express';
import { resourcesService, ResourcesService } from './resources.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class ResourcesController {
  constructor(private readonly service: ResourcesService = resourcesService) {}

  listResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resources, meta } = await this.service.listResources(req.query);
      sendSuccess({
        res,
        statusCode: 200,
        data: resources,
        meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.service.getResourceByIdOrSlug(id);
      sendSuccess({
        res,
        statusCode: 200,
        data: resource,
      });
    } catch (error: any) {
      if (error?.statusCode === 404) {
        sendError({
          res,
          statusCode: 404,
          code: error.code || 'RESOURCE_NOT_FOUND',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.listCategories();
      sendSuccess({
        res,
        statusCode: 200,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.service.getCategory(id);
      sendSuccess({
        res,
        statusCode: 200,
        data: category,
      });
    } catch (error: any) {
      if (error?.statusCode === 404) {
        sendError({
          res,
          statusCode: 404,
          code: error.code || 'CATEGORY_NOT_FOUND',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}

export const resourcesController = new ResourcesController();
