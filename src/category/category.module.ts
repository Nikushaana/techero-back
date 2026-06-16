import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { UploadsModule } from 'src/common/uploads/uploads.module';

@Module({
    imports: [TypeOrmModule.forFeature([Category]), UploadsModule],
    providers: [CategoryService],
    exports: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
