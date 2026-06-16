import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branches.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Branch])],
    providers: [BranchesService],
    exports: [BranchesService, TypeOrmModule],
})
export class BranchesModule {}
