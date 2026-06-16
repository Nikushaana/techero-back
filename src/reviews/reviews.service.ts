import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { instanceToPlain } from 'class-transformer';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { GetReviewsDto } from './dto/get-reviews.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,

        private readonly baseUserService: BaseUserService,

        private readonly notificationService: NotificationsService,
    ) { }

    // individual and company
    async createReview(userId: number, repo: any, createReviewDto: CreateReviewDto) {
        const user = await this.baseUserService.getUser(userId, repo);

        const review = this.reviewRepo.create({
            ...createReviewDto
        });

        if ("companyName" in user) {
            review.company = user;
        } else {
            review.individual = user;
        }

        await this.reviewRepo.save(review);

        // send notification to admin
        await this.notificationService.sendNotification(
            `დაემატა შეფასება №${review.id} ${("companyName" in user ? user.companyName : (user.name + " " + user.lastName))}-ს მიერ`,
            NotificationType.NEW_REVIEW,
            'admin',
            undefined,
            {
                review_id: review.id
            },
        );
        // send notification to user
        await this.notificationService.sendNotification(
            `შეფასება №${review.id} დაემატა.`,
            NotificationType.NEW_REVIEW,
            user.role,
            userId,
        );

        return { message: `Review created successfully`, review: instanceToPlain(review) };
    }

    async getReviews(dto: GetReviewsDto, userId: number, repo: any) {
        const { page = 1, limit = 10 } = dto;

        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const [reviews, total] = await this.reviewRepo.findAndCount({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // admin
    async getAdminReviews(dto: GetReviewsDto) {
        const { page = 1, limit = 10 } = dto;

        const [reviews, total] = await this.reviewRepo.findAndCount({
            order: { created_at: 'DESC' },
            relations: ['individual', 'company'],
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAdminOneReviewEntity(id: number) {
        const review = await this.reviewRepo.findOne({
            where: { id }, relations: ['individual', 'company']
        });
        if (!review) throw new NotFoundException('Review not found');

        return review
    }

    async getAdminOneReview(id: number) {
        const review = await this.getAdminOneReviewEntity(id)

        return instanceToPlain(review)
    }

    async updateAdminOneReview(
        id: number,
        updateReviewDto: UpdateReviewDto
    ) {
        const review = await this.getAdminOneReviewEntity(id)

        // Merge updates
        this.reviewRepo.merge(review, {
            ...updateReviewDto
        });

        await this.reviewRepo.save(review);

        return {
            message: 'Review updated successfully',
            review
        };
    }

    async deleteAdminReview(id: number) {
        const review = await this.getAdminOneReviewEntity(id)

        await this.reviewRepo.remove(review);

        return {
            message: 'Review deleted successfully',
        };
    }

    // front
    async getActiveReviews() {
        const reviews = await this.reviewRepo.find({
            where: { status: true },
            order: { created_at: 'DESC' },
            relations: ['company', 'individual'],
        });

        return instanceToPlain(reviews);
    }
}
