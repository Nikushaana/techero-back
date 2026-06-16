import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualClient } from './entities/individual-client.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateIndividualDto } from './dto/update-individual.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { ReviewsService } from 'src/reviews/reviews.service';
import { AddressService } from 'src/address/address.service';
import { OrderService } from 'src/order/order.service';
import { UpdateAdminIndividualTechnicianDeliveryDto } from 'src/admin/dto/update-adm-ind-tech-del.dto';
import { RepairDecisionDto } from 'src/order/dto/repair-decision.dto';
import { GetOrdersDto } from 'src/order/dto/get-orders.dto';
import { GetAddressesDto } from 'src/address/dto/get-addresses.dto';
import { GetReviewsDto } from 'src/reviews/dto/get-reviews.dto';
import { GetUsersDto } from 'src/common/services/base-user/dto/get-users.dto';

@Injectable()
export class IndividualClientService {
    constructor(
        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly reviewsService: ReviewsService,

        private readonly addressService: AddressService,

        private readonly orderService: OrderService,
    ) { }

    // individual
    async getIndividuals(dto: GetUsersDto) {
        const findIndividuals = await this.baseUserService.getUsers(this.individualClientRepo, dto, [
            'phone',
            'name',
            'lastName'
        ]);

        return instanceToPlain(findIndividuals);
    }

    async getAdminOneIndividual(individualId: number) {
        const findOneIndividual = await this.baseUserService.getUser(individualId, this.individualClientRepo);

        return instanceToPlain(findOneIndividual)
    }

    async updateAdminOneIndividual(individualId: number, updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(individualId, this.individualClientRepo, updateAdminIndividualTechnicianDeliveryDto, images, "admin");
    }

    async updateIndividual(individualId: number, updateIndividualDto: UpdateIndividualDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(individualId, this.individualClientRepo, updateIndividualDto, images);
    }

    async changePassword(individualId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.individualClientRepo, individualId, changePasswordDto);
    }

    // send and verify sent code
    async sendChangeNumberCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'change-number');
    }

    async changeNumber(individualId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.individualClientRepo, individualId, changeNumberDto);
    }

    // order
    async createOrder(individualId: number, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.createOrder(individualId, this.individualClientRepo, createOrderDto, images, videos);
    }

    async getOrders(dto: GetOrdersDto, individualId: number) {
        return this.orderService.getOrders(dto, individualId, this.individualClientRepo);
    }

    async getOneOrder(individualId: number, id: number) {
        return this.orderService.getOneOrder(individualId, id, this.individualClientRepo);
    }

    async updateOneOrder(individualId: number, id: number, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.updateOneOrder(individualId, id, this.individualClientRepo, updateUserOrderDto, images, videos);
    }

    // order flow
    async toTechnician(individualId: number, id: number) {
        return this.orderService.toTechnician(individualId, id, this.individualClientRepo);
    }

    async decideRepair(individualId: number, id: number, repairDecisionDto: RepairDecisionDto) {
        return this.orderService.decideRepair(individualId, id, this.individualClientRepo, repairDecisionDto);
    }

    async cancelled(individualId: number, id: number) {
        return this.orderService.cancelled(individualId, id, this.individualClientRepo);
    }

    async completed(individualId: number, id: number) {
        return this.orderService.completed(individualId, id, this.individualClientRepo);
    }

    async completedOnSite(individualId: number, id: number) {
        return this.orderService.completedOnSite(individualId, id, this.individualClientRepo);
    }

    // address
    async createAddress(individualId: number, createAddressDto: CreateAddressDto) {
        return this.addressService.createAddress(individualId, this.individualClientRepo, createAddressDto);
    }

    async getAddresses(dto: GetAddressesDto, individualId: number) {
        return this.addressService.getAddresses(dto, individualId, this.individualClientRepo);
    }

    async getUserOneAddress(individualId: number, id: number) {
        return this.addressService.getUserOneAddress(individualId, id, this.individualClientRepo);
    }

    async deleteOneAddress(individualId: number, id: number) {
        return this.addressService.deleteOneAddress(individualId, id, this.individualClientRepo);
    }

    // review
    async createReview(individualId: number, createReviewDto: CreateReviewDto) {
        return this.reviewsService.createReview(individualId, this.individualClientRepo, createReviewDto);
    }

    async getIndividualReviews(dto: GetReviewsDto, individualId: number) {
        return this.reviewsService.getReviews(dto, individualId, this.individualClientRepo);
    }
}
