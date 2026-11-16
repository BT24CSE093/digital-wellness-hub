import { guidesRepository, GuidesRepository } from './guides.repository';
import { GuideQueryParams, CreateGuideDTO, UpdateGuideDTO } from './guides.types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class GuidesService {
  constructor(private readonly repo: GuidesRepository = guidesRepository) {}

  async listGuides(params: GuideQueryParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 12;

    const { guides, total } = await this.repo.findMany({ ...params, page, limit }, true);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      guides,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async listAdminGuides(params: GuideQueryParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 20;

    const { guides, total } = await this.repo.findMany({ ...params, page, limit }, false);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      guides,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getGuideBySlug(slug: string, onlyPublished = true) {
    const guide = await this.repo.findBySlug(slug, onlyPublished);
    if (!guide) {
      const error = new Error(`Guide with slug '${slug}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'GUIDE_NOT_FOUND';
      throw error;
    }

    const relatedGuides = await this.repo.findRelated(guide.platform, guide.slug, 3);

    return {
      guide,
      relatedGuides,
    };
  }

  async createGuide(dto: CreateGuideDTO, authorId: string) {
    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    if (!slug) {
      slug = `guide-${Date.now()}`;
    }

    const existing = await this.repo.findBySlug(slug, false);
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return this.repo.create({
      ...dto,
      slug,
      authorId,
    });
  }

  async updateGuide(id: string, dto: UpdateGuideDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const error = new Error(`Guide with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'GUIDE_NOT_FOUND';
      throw error;
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slug = slugify(dto.slug);
      const duplicate = await this.repo.findBySlug(slug, false);
      if (duplicate && duplicate.id !== id) {
        const error = new Error(`Guide slug '${slug}' is already in use`);
        (error as unknown as { statusCode: number }).statusCode = 409;
        (error as unknown as { code: string }).code = 'DUPLICATE_SLUG';
        throw error;
      }
      dto.slug = slug;
    }

    return this.repo.update(id, dto);
  }

  async deleteGuide(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const error = new Error(`Guide with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'GUIDE_NOT_FOUND';
      throw error;
    }

    return this.repo.delete(id);
  }

  async publishGuide(id: string, isPublished: boolean) {
    return this.updateGuide(id, { isPublished });
  }
}

export const guidesService = new GuidesService();
