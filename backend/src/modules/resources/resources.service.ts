import { resourcesRepository, ResourcesRepository } from './resources.repository';
import {
  ResourceQueryParams,
  CreateResourceDTO,
  UpdateResourceDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from './resources.types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ResourcesService {
  constructor(private readonly repo: ResourcesRepository = resourcesRepository) {}

  async listResources(params: ResourceQueryParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 12;

    const { resources, total } = await this.repo.findMany({
      ...params,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      resources,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getResourceByIdOrSlug(idOrSlug: string) {
    const resource = await this.repo.findByIdOrSlug(idOrSlug);
    if (!resource) {
      const error = new Error(`Resource with identifier '${idOrSlug}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'RESOURCE_NOT_FOUND';
      throw error;
    }
    return resource;
  }

  async createResource(dto: CreateResourceDTO, userId?: string) {
    // Validate category exists
    const category = await this.repo.findCategoryByIdOrSlug(dto.categoryId);
    if (!category) {
      const error = new Error(`Category with ID '${dto.categoryId}' does not exist`);
      (error as unknown as { statusCode: number }).statusCode = 400;
      (error as unknown as { code: string }).code = 'INVALID_CATEGORY';
      throw error;
    }

    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    if (!slug) {
      slug = `resource-${Date.now()}`;
    }

    // Ensure slug uniqueness
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const isVerified = dto.isVerified ?? false;

    return this.repo.create({
      ...dto,
      slug,
      submittedByUserId: userId,
      verifiedByUserId: isVerified ? userId : undefined,
      verifiedAt: isVerified ? new Date() : undefined,
    });
  }

  async updateResource(id: string, dto: UpdateResourceDTO, adminUserId?: string) {
    const existing = await this.repo.findByIdOrSlug(id);
    if (!existing) {
      const error = new Error(`Resource with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    if (dto.categoryId) {
      const category = await this.repo.findCategoryByIdOrSlug(dto.categoryId);
      if (!category) {
        const error = new Error(`Category with ID '${dto.categoryId}' does not exist`);
        (error as unknown as { statusCode: number }).statusCode = 400;
        (error as unknown as { code: string }).code = 'INVALID_CATEGORY';
        throw error;
      }
    }

    let verifiedUpdate: { verifiedByUserId?: string | null; verifiedAt?: Date | null } = {};
    if (dto.isVerified !== undefined) {
      if (dto.isVerified && !existing.isVerified) {
        verifiedUpdate = {
          verifiedByUserId: adminUserId,
          verifiedAt: new Date(),
        };
      } else if (!dto.isVerified && existing.isVerified) {
        verifiedUpdate = {
          verifiedByUserId: null,
          verifiedAt: null,
        };
      }
    }

    return this.repo.update(id, {
      ...dto,
      ...verifiedUpdate,
    });
  }

  async deleteResource(id: string) {
    const existing = await this.repo.findByIdOrSlug(id);
    if (!existing) {
      const error = new Error(`Resource with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    return this.repo.delete(id);
  }

  async verifyResource(id: string, isVerified: boolean, adminUserId: string) {
    return this.updateResource(id, { isVerified }, adminUserId);
  }

  // Categories
  async listCategories() {
    return this.repo.findCategories();
  }

  async getCategory(idOrSlug: string) {
    const category = await this.repo.findCategoryByIdOrSlug(idOrSlug);
    if (!category) {
      const error = new Error(`Category '${idOrSlug}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'CATEGORY_NOT_FOUND';
      throw error;
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDTO) {
    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    if (!slug) {
      slug = `category-${Date.now()}`;
    }

    const existing = await this.repo.findCategoryByIdOrSlug(slug);
    if (existing) {
      const error = new Error(`A category with name or slug '${slug}' already exists`);
      (error as unknown as { statusCode: number }).statusCode = 409;
      (error as unknown as { code: string }).code = 'DUPLICATE_CATEGORY';
      throw error;
    }

    return this.repo.createCategory({
      ...dto,
      slug,
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO) {
    const existing = await this.repo.findCategoryByIdOrSlug(id);
    if (!existing) {
      const error = new Error(`Category with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'CATEGORY_NOT_FOUND';
      throw error;
    }

    return this.repo.updateCategory(id, dto);
  }

  async deleteCategory(id: string) {
    const existing = await this.repo.findCategoryByIdOrSlug(id);
    if (!existing) {
      const error = new Error(`Category with ID '${id}' was not found`);
      (error as unknown as { statusCode: number }).statusCode = 404;
      (error as unknown as { code: string }).code = 'CATEGORY_NOT_FOUND';
      throw error;
    }

    return this.repo.deleteCategory(id);
  }
}

export const resourcesService = new ResourcesService();
