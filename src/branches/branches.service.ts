import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branches.entity';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { instanceToPlain } from 'class-transformer';
import { GetBranchesDto } from './dto/get-branches.dto';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchRepo: Repository<Branch>,
    ) { }

    async createBranch(createBranchDto: CreateBranchDto) {
        const existing = await this.branchRepo.findOne({ where: { name: createBranchDto.name } });
        if (existing) throw new BadRequestException('Branch already exists');

        const branch = this.branchRepo.create({
            ...createBranchDto
        });

        await this.branchRepo.save(branch);

        return { message: 'Branch created successfully', branch };
    }

    async getBranches(dto: GetBranchesDto) {
        const { page = 1, limit } = dto;

        const [branches, total] = await this.branchRepo.findAndCount({
            order: { created_at: 'DESC' },
            skip: limit ? (page - 1) * limit : undefined,
            take: limit,
        });

        return {
            data: branches,
            total,
            page,
            limit,
            totalPages: limit ? Math.ceil(total / limit) : 1,
        };
    }

    async getFrontBranches() {
        const branches = await this.branchRepo.find();

        return instanceToPlain(branches);
    }

    async getOneBranch(id: number) {
        const branch = await this.branchRepo.findOne({
            where: { id }
        });
        if (!branch) throw new NotFoundException('Branch not found');

        return branch
    }

    async updateOneBranch(
        id: number,
        updateBranchDto: UpdateBranchDto
    ) {
        const branch = await this.getOneBranch(id)

        // Merge updates
        this.branchRepo.merge(branch, {
            ...updateBranchDto
        });

        await this.branchRepo.save(branch);

        return {
            message: 'Branch updated successfully',
            branch
        };
    }

    async deleteBranch(id: number) {
        const branch = await this.getOneBranch(id)

        // Delete branch
        await this.branchRepo.remove(branch);

        return {
            message: 'Branch deleted successfully',
        };
    }
}
