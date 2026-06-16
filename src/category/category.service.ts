import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UploadsService } from 'src/common/uploads/uploads.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        private readonly uploadsService: UploadsService,
    ) { }

    // admin
    async createCategory(createCategoryDto: CreateCategoryDto) {
        const existing = await this.categoryRepo.findOne({ where: { name: createCategoryDto.name } });
        if (existing) throw new BadRequestException('Category already exists');

        const category = this.categoryRepo.create({
            ...createCategoryDto
        });

        await this.categoryRepo.save(category);

        return { message: 'Category created successfully', category };
    }

    async getCategories(dto: GetCategoriesDto) {
        const { page = 1, limit = 10 } = dto;

        const [categories, total] = await this.categoryRepo.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getOneCategory(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['orders']
        });
        if (!category) throw new NotFoundException('Category not found');

        return category
    }

    async updateOneCategory(id: number, updateCategoryDto: UpdateCategoryDto, images: Express.Multer.File[] = []) {
        const category = await this.getOneCategory(id)

        let imagesToDeleteArray: string[] = [];
        if (updateCategoryDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateCategoryDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (relativeUrl) => {
                    // remove the file physically from the volume
                    await this.uploadsService.deleteFile(relativeUrl).catch(err => {
                        console.error(`Failed to delete file from volume: ${relativeUrl}`, err);
                    })
                }),
            );
        }

        const remainingImages = (category.images || []).filter((img) => !imagesToDeleteArray.includes(img));

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const newCount = images?.length || 0;
        const totalAfterUpdate = remainingImages.length + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${remainingImages.length}, new: ${newCount})`,
            );
        }

        let newUploadedUrls: string[] = [];
        if (images && images.length > 0) {
            const subFolder = `categories/${id}`;

            newUploadedUrls = await Promise.all(
                images.map((file) => this.uploadsService.uploadImage(file, subFolder, 800))
            );
        }

        // Merge updates
        const updatedCategory = this.categoryRepo.merge(category, updateCategoryDto);

        // Append new images to existing ones
        updatedCategory.images = [...remainingImages, ...newUploadedUrls];

        await this.categoryRepo.save(updatedCategory);

        return { message: 'Category updated successfully', category };
    }

    async deleteCategory(id: number) {
        const category = await this.getOneCategory(id)

        // Check if there are related orders
        if (category.orders && category.orders.length > 0) {
            throw new BadRequestException('Cannot delete category with existing orders');
        }

        // Delete images if any
        if (category.images && category.images.length > 0) {
            await Promise.all(
                category.images.map(async (relativeUrl) => {
                    // remove the file physically from the volume
                    await this.uploadsService.deleteFile(relativeUrl).catch(err => {
                        console.error(`Failed to delete file from volume: ${relativeUrl}`, err);
                    })
                }),
            );
        }

        // Delete category
        await this.categoryRepo.remove(category);

        return {
            message: 'Category deleted successfully',
        };
    }

    // front
    async getActiveCategories(dto: GetCategoriesDto) {
        const { page = 1, limit } = dto;

        const [categories, total] = await this.categoryRepo.findAndCount({
            where: { status: true },
            order: { created_at: 'DESC' },
            skip: limit ? (page - 1) * limit : undefined,
            take: limit,
        });

        return {
            data: categories,
            total,
            page,
            limit,
            totalPages: limit ? Math.ceil(total / limit) : 1,
        };
    }
}
