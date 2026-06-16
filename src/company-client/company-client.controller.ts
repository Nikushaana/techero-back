import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyClientService } from './company-client.service';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestInfo } from 'src/common/types/request-info';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { MultipleFilesUpload } from 'src/common/interceptors/MultipleFilesUpload.interceptor';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RepairDecisionDto } from 'src/order/dto/repair-decision.dto';
import { CalculatePriceDto } from 'src/pricing/dto/calculate-price.dto';
import { PricingService } from 'src/pricing/pricing.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { GetNotificationsDto } from 'src/notifications/dto/get-notifications.dto';
import { GetOrdersDto } from 'src/order/dto/get-orders.dto';
import { GetAddressesDto } from 'src/address/dto/get-addresses.dto';
import { GetReviewsDto } from 'src/reviews/dto/get-reviews.dto';
import { GetTransactionsDto } from 'src/transactions/dto/get-transactions.dto';

@Controller('company')
export class CompanyClientController {
    constructor(
        private readonly companyClientService: CompanyClientService,

        private readonly notificationsService: NotificationsService,

        private readonly pricingService: PricingService,

        private readonly transactionsService: TransactionsService,
    ) { }

    // company
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateCompany(@Req() req: RequestInfo, @Body() updateCompanyDto: UpdateCompanyDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.companyClientService.updateCompany(req.user.id, updateCompanyDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.companyClientService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.companyClientService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.companyClientService.changeNumber(req.user.id, changeNumberDto);
    }

    // order
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-order')
    @UseInterceptors(
        MultipleFilesUpload([
            { name: 'images', maxCount: 3, type: 'image' },
            { name: 'videos', maxCount: 1, type: 'video' },
        ]),
    )
    async createOrder(@Req() req: RequestInfo, @Body() createOrderDto: CreateOrderDto, @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }) {
        const images = files?.images || [];
        const videos = files?.videos || [];
        return this.companyClientService.createOrder(req.user.id, createOrderDto, images, videos);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('orders')
    async getOrders(@Query() query: GetOrdersDto, @Req() req: RequestInfo) {
        return this.companyClientService.getOrders(query, req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('orders/:id')
    async getOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.getOneOrder(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id')
    @UseInterceptors(
        MultipleFilesUpload([
            { name: 'images', maxCount: 3, type: 'image' },
            { name: 'videos', maxCount: 1, type: 'video' },
        ]),
    )
    async updateOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number, @Body() updateUserOrderDto: UpdateUserOrderDto, @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }) {
        const images = files?.images || [];
        const videos = files?.videos || [];
        return this.companyClientService.updateOneOrder(req.user.id, id, updateUserOrderDto, images, videos);
    }

    // pricing
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('calculate-price')
    async calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
        return this.pricingService.calculatePrice(calculatePriceDto);
    }

    // order flow
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id/to-technician')
    async toTechnician(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.toTechnician(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id/decision')
    async decideRepair(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number, @Body() repairDecisionDto: RepairDecisionDto) {
        return this.companyClientService.decideRepair(req.user.id, id, repairDecisionDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id/cancelled')
    async cancelled(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.cancelled(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id/completed')
    async completed(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.completed(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id/completed-on-site')
    async completedOnSite(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.completedOnSite(req.user.id, id);
    }

    // address
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-address')
    async createAddress(@Req() req: RequestInfo, @Body() createAddressDto: CreateAddressDto) {
        return this.companyClientService.createAddress(req.user.id, createAddressDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('addresses')
    async getAddresses(@Query() query: GetAddressesDto, @Req() req: RequestInfo) {
        return this.companyClientService.getAddresses(query, req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('addresses/:id')
    async getUserOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.getUserOneAddress(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Delete('addresses/:id')
    async deleteOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.deleteOneAddress(req.user.id, id);
    }

    // review
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-review')
    async createReview(@Req() req: RequestInfo, @Body() createReviewDto: CreateReviewDto) {
        return this.companyClientService.createReview(req.user.id, createReviewDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('reviews')
    async getReviews(@Query() query: GetReviewsDto, @Req() req: RequestInfo) {
        return this.companyClientService.getReviews(query, req.user.id);
    }

    // notifications
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('notifications')
    async getNotifications(@Req() req: RequestInfo, @Query() query: GetNotificationsDto) {
        return this.notificationsService.getNotifications(query, "company", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification("company", id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('notifications/unread')
    async getUnreadNotificationsCount(@Req() req: RequestInfo) {
        return this.notificationsService.getUnreadNotificationsCount("company", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('notifications/read-all')
    async readAllNotifications(@Req() req: RequestInfo) {
        return this.notificationsService.readAllNotifications("company", req.user.id);
    }

    // transactions
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('transactions')
    async getUserTransactions(@Query() query: GetTransactionsDto, @Req() req: RequestInfo) {
        return this.transactionsService.getUserTransactions(query, "company", req.user.id);
    }
}
