import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyClient } from './entities/company-client.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { ReviewsService } from 'src/reviews/reviews.service';
import { AddressService } from 'src/address/address.service';
import { OrderService } from 'src/order/order.service';
import { UpdateAdminCompanyDto } from 'src/admin/dto/update-admin-company.dto';
import { RepairDecisionDto } from 'src/order/dto/repair-decision.dto';
import { GetOrdersDto } from 'src/order/dto/get-orders.dto';
import { GetAddressesDto } from 'src/address/dto/get-addresses.dto';
import { GetReviewsDto } from 'src/reviews/dto/get-reviews.dto';
import { GetUsersDto } from 'src/common/services/base-user/dto/get-users.dto';

@Injectable()
export class CompanyClientService {
    constructor(
        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly reviewsService: ReviewsService,

        private readonly addressService: AddressService,

        private readonly orderService: OrderService,
    ) { }

    // company
    async getCompanies(dto: GetUsersDto) {
        const findCompanies = await this.baseUserService.getUsers(this.companyClientRepo, dto, [
            'phone',
            'companyAgentName',
            'companyAgentLastName',
            'companyName',
            'companyIdentificationCode'
        ]);

        return instanceToPlain(findCompanies);
    }

    async getAdminOneCompany(companyId: number) {
        const findOneCompany = await this.baseUserService.getUser(companyId, this.companyClientRepo);

        return instanceToPlain(findOneCompany)
    }

    async updateAdminOneCompany(companyId: number, updateAdminCompanyDto: UpdateAdminCompanyDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(companyId, this.companyClientRepo, updateAdminCompanyDto, images, "admin");
    }

    async updateCompany(companyId: number, updateCompanyDto: UpdateCompanyDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(companyId, this.companyClientRepo, updateCompanyDto, images);
    }

    async changePassword(companyId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.companyClientRepo, companyId, changePasswordDto);
    }

    // send and verify sent code
    async sendChangeNumberCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'change-number');
    }

    async changeNumber(companyId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.companyClientRepo, companyId, changeNumberDto);
    }

    // order
    async createOrder(companyId: number, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.createOrder(companyId, this.companyClientRepo, createOrderDto, images, videos);
    }

    async getOrders(dto: GetOrdersDto, companyId: number) {
        return this.orderService.getOrders(dto, companyId, this.companyClientRepo);
    }

    async getOneOrder(companyId: number, id: number) {
        return this.orderService.getOneOrder(companyId, id, this.companyClientRepo);
    }

    async updateOneOrder(companyId: number, id: number, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.updateOneOrder(companyId, id, this.companyClientRepo, updateUserOrderDto, images, videos);
    }

    // order flow
    async toTechnician(companyId: number, id: number) {
        return this.orderService.toTechnician(companyId, id, this.companyClientRepo);
    }

    async decideRepair(companyId: number, id: number, repairDecisionDto: RepairDecisionDto) {
        return this.orderService.decideRepair(companyId, id, this.companyClientRepo, repairDecisionDto);
    }

    async cancelled(companyId: number, id: number) {
        return this.orderService.cancelled(companyId, id, this.companyClientRepo);
    }

    async completed(companyId: number, id: number) {
        return this.orderService.completed(companyId, id, this.companyClientRepo);
    }

    async completedOnSite(companyId: number, id: number) {
        return this.orderService.completedOnSite(companyId, id, this.companyClientRepo);
    }

    // address
    async createAddress(companyId: number, createAddressDto: CreateAddressDto) {
        return this.addressService.createAddress(companyId, this.companyClientRepo, createAddressDto);
    }

    async getAddresses(dto: GetAddressesDto, companyId: number) {
        return this.addressService.getAddresses(dto, companyId, this.companyClientRepo);
    }

    async getUserOneAddress(companyId: number, id: number) {
        return this.addressService.getUserOneAddress(companyId, id, this.companyClientRepo);
    }

    async deleteOneAddress(companyId: number, id: number) {
        return this.addressService.deleteOneAddress(companyId, id, this.companyClientRepo);
    }

    // create review
    async createReview(companyId: number, createReviewDto: CreateReviewDto) {
        return this.reviewsService.createReview(companyId, this.companyClientRepo, createReviewDto);
    }

    async getReviews(dto: GetReviewsDto, companyId: number) {
        return this.reviewsService.getReviews(dto, companyId, this.companyClientRepo);
    }
}
