import { Request, Response, NextFunction } from 'express';
import { guidesService, GuidesService } from './guides.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class GuidesController {
  constructor(private readonly service: GuidesService = guidesService) {}

  listGuides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { guides, meta } = await this.service.listGuides(req.query);
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

  getGuideBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const data = await this.service.getGuideBySlug(slug, true);
      sendSuccess({
        res,
        statusCode: 200,
        data,
      });
    } catch (error: any) {
      if (error?.statusCode === 404) {
        sendError({
          res,
          statusCode: 404,
          code: error.code || 'GUIDE_NOT_FOUND',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}

export const guidesController = new GuidesController();
