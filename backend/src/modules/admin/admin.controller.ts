import { Request, Response, NextFunction } from 'express';
import { resourcesService, ResourcesService } from '../resources/resources.service';
import { guidesService, GuidesService } from '../guides/guides.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class AdminController {
  constructor(
    private readonly resService: ResourcesService = resourcesService,
    private readonly guideService: GuidesService = guidesService
  ) {}

  // Resource Management
  createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resource = await this.resService.createResource(req.body, req.user!.sub);
      sendSuccess({
        res,
        statusCode: 201,
        data: resource,
        message: 'Resource created successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'RESOURCE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.resService.updateResource(id, req.body, req.user!.sub);
      sendSuccess({
        res,
        statusCode: 200,
        data: resource,
        message: 'Resource updated successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'RESOURCE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.resService.deleteResource(id);
      sendSuccess({
        res,
        statusCode: 200,
        message: 'Resource deleted successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'RESOURCE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  verifyResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;
      const resource = await this.resService.verifyResource(id, isVerified, req.user!.sub);
      sendSuccess({
        res,
        statusCode: 200,
        data: resource,
        message: `Resource verification status set to ${isVerified}`,
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'RESOURCE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  // Category Management
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.resService.createCategory(req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'CATEGORY_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.resService.updateCategory(id, req.body);
      sendSuccess({
        res,
        statusCode: 200,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'CATEGORY_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.resService.deleteCategory(id);
      sendSuccess({
        res,
        statusCode: 200,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'CATEGORY_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  // Guide Management
  listGuides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { guides, meta } = await this.guideService.listAdminGuides(req.query);
      sendSuccess({
        res,
        statusCode: 200,
        data: guides,
        meta,
      });
    } catch (error) {
      next(error);
    }
  };

  createGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const guide = await this.guideService.createGuide(req.body, req.user!.sub);
      sendSuccess({
        res,
        statusCode: 201,
        data: guide,
        message: 'Guide created successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'GUIDE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  updateGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const guide = await this.guideService.updateGuide(id, req.body);
      sendSuccess({
        res,
        statusCode: 200,
        data: guide,
        message: 'Guide updated successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'GUIDE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.guideService.deleteGuide(id);
      sendSuccess({
        res,
        statusCode: 200,
        message: 'Guide deleted successfully',
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'GUIDE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  publishGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;
      const guide = await this.guideService.publishGuide(id, isPublished);
      sendSuccess({
        res,
        statusCode: 200,
        data: guide,
        message: `Guide publish status set to ${isPublished}`,
      });
    } catch (error: any) {
      if (error?.statusCode) {
        sendError({
          res,
          statusCode: error.statusCode,
          code: error.code || 'GUIDE_ERROR',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}

export const adminController = new AdminController();
