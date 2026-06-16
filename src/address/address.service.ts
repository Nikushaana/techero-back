import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { instanceToPlain } from 'class-transformer';
import { Branch } from 'src/branches/entities/branches.entity';
import { getDistanceFromLatLonInKm } from 'src/common/utils/geo.utils';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { Order } from 'src/order/entities/order.entity';
import { GetAddressesDto } from './dto/get-addresses.dto';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,

        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        private readonly baseUserService: BaseUserService,
    ) { }

    // for individual and company

    async createAddress(userId: number, repo: any, createAddressDto: CreateAddressDto) {
        const user = await this.baseUserService.getUser(userId, repo);

        const existingAddress = await this.addressRepo.findOne({
            where: {
                name: createAddressDto.name,
                ...("companyName" in user ? { company: { id: user.id } } : { individual: { id: user.id } })
            },
            relations: ["company", "individual"]
        });

        if (existingAddress) {
            throw new BadRequestException('You already have an address with this name.');
        }

        const branches = await this.branchRepo.find();
        if (!branches.length) throw new BadRequestException('No branches available — cannot add address');

        const { location } = createAddressDto;

        let matchedBranch: Branch | null = null;
        let minDistance = Infinity;

        for (const branch of branches) {
            const distance = getDistanceFromLatLonInKm(
                location.lat,
                location.lng,
                branch.location.lat,
                branch.location.lng
            );

            if (distance <= branch.coverage_radius_km && distance < minDistance) {
                minDistance = distance;
                matchedBranch = branch;
            }
        }

        if (!matchedBranch) {
            throw new BadRequestException(
                'Address is outside all branch coverage areas. Please choose a closer location.'
            );
        }

        const address = this.addressRepo.create({
            ...createAddressDto,
            branch: matchedBranch,
        });

        if ("companyName" in user) {
            address.company = user;
        } else {
            address.individual = user;
        }

        await this.addressRepo.save(address);

        return { message: `Address created successfully`, address: instanceToPlain(address) };
    }

    async getAddresses(dto: GetAddressesDto, userId: number, repo: any) {
        const { page = 1, limit } = dto;

        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const [addresses, total] = await this.addressRepo.findAndCount({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
            skip: limit ? (page - 1) * limit : undefined,
            take: limit,
        });

        return {
            data: instanceToPlain(addresses),
            total,
            page,
            limit,
            totalPages: limit ? Math.ceil(total / limit) : 1,
        };
    }

    async getUserOneAddress(userId: number, id: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!address) throw new NotFoundException('Address not found');

        return address
    }

    async getOneAddress(id: number) {
        const address = await this.addressRepo.findOne({
            where: { id },
            relations: ['branch'],
        });
        if (!address) throw new NotFoundException('Address not found');

        return address
    }

    async deleteOneAddress(userId: number, id: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!address) throw new NotFoundException('Address  not found');

        const usedInOrders = await this.orderRepo.count({
            where: [
                { [relationKey]: { id: userId }, address: { id } },
            ],
        });

        if (usedInOrders > 0) {
            throw new BadRequestException('Address cannot be deleted because it is used in an order');
        }

        await this.addressRepo.delete({
            id,
            [relationKey]: { id: userId },
        });

        return {
            message: 'Address deleted successfully',
            address,
        };
    }
}
