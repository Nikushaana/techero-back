import { Controller, Get, Query } from '@nestjs/common';
import { BranchesService } from 'src/branches/branches.service';
import { FaqService } from 'src/faq/faq.service';
import { CategoryService } from 'src/category/category.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { StreetsService } from 'src/streets/streets.service';
import { GetStreetsDto } from 'src/streets/dto/get-streets.dto';
import { GetCategoriesDto } from 'src/category/dto/get-categories.dto';

@Controller('front')
export class FrontController {
    constructor(
        private readonly branchesService: BranchesService,

        private readonly faqService: FaqService,

        private readonly categoryService: CategoryService,

        private readonly reviewsService: ReviewsService,

        private readonly streetsService: StreetsService,
    ) { }

    @Get('categories')
    async getCategories(@Query() query: GetCategoriesDto) {
        return this.categoryService.getActiveCategories(query);
    }

    @Get('faqs')
    async getActiveFaqs() {
        return this.faqService.getActiveFaqs();
    }

    @Get('reviews')
    async getReviews() {
        return this.reviewsService.getActiveReviews();
    }

    @Get('branches')
    async getFrontBranches() {
        return this.branchesService.getFrontBranches();
    }

    @Get('streets')
    async getStreets(@Query() query: GetStreetsDto) {
        return this.streetsService.getStreets(query.street);
    }
}
