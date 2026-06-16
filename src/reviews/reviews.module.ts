import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([Review]), BaseUserModule, NotificationsModule],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
