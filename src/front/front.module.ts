import { Module } from '@nestjs/common';
import { FrontController } from './front.controller';
import { BranchesModule } from 'src/branches/branches.module';
import { FaqModule } from 'src/faq/faq.module';
import { CategoryModule } from 'src/category/category.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { StreetsModule } from 'src/streets/streets.module';

@Module({
  imports: [BranchesModule, FaqModule, CategoryModule, ReviewsModule, StreetsModule],
  controllers: [FrontController]
})
export class FrontModule { }
