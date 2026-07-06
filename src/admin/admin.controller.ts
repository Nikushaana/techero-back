import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateAdminCompanyDto } from './dto/update-admin-company.dto';
import { UpdateAdminOrderDto } from 'src/order/dto/update-admin-order.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { CreateFaqDto } from 'src/faq/dto/create-faq.dto';
import { UpdateFaqDto } from 'src/faq/dto/update-category.dto';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { UpdateReviewDto } from 'src/reviews/dto/update-review.dto';
import { CreateBranchDto } from 'src/branches/dto/create-branch.dto';
import { UpdateBranchDto } from 'src/branches/dto/update-branch.dto';
import { UpdateAdminIndividualTechnicianDeliveryDto } from './dto/update-adm-ind-tech-del.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { BranchesService } from 'src/branches/branches.service';
import { OrderService } from 'src/order/order.service';
import { FaqService } from 'src/faq/faq.service';
import { CategoryService } from 'src/category/category.service';
import { IndividualClientService } from 'src/individual-client/individual-client.service';
import { CompanyClientService } from 'src/company-client/company-client.service';
import { TechnicianService } from 'src/technician/technician.service';
import { DeliveryService } from 'src/delivery/delivery.service';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { GetNotificationsDto } from 'src/notifications/dto/get-notifications.dto';
import { GetOrdersDto } from 'src/order/dto/get-orders.dto';
import { GetReviewsDto } from 'src/reviews/dto/get-reviews.dto';
import { GetTransactionsDto } from 'src/transactions/dto/get-transactions.dto';
import { GetCategoriesDto } from 'src/category/dto/get-categories.dto';
import { GetFaqsDto } from 'src/faq/dto/get-faqs.dto';
import { GetBranchesDto } from 'src/branches/dto/get-branches.dto';
import { GetUsersDto } from 'src/common/services/base-user/dto/get-users.dto';
import { MultipleFilesUpload } from 'src/common/interceptors/MultipleFilesUpload.interceptor';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly notificationsService: NotificationsService,

        private readonly reviewsService: ReviewsService,

        private readonly branchesService: BranchesService,

        private readonly orderService: OrderService,

        private readonly faqService: FaqService,

        private readonly categoryService: CategoryService,

        private readonly individualClientService: IndividualClientService,

        private readonly companyClientService: CompanyClientService,

        private readonly technicianService: TechnicianService,

        private readonly deliveryService: DeliveryService,

        private readonly baseUserService: BaseUserService,

        private readonly transactionsService: TransactionsService,
    ) { }

    // individuals
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('individuals')
    async getIndividuals(@Query() query: GetUsersDto) {
        return this.individualClientService.getIndividuals(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('individuals/:id')
    async getAdminOneIndividual(@Param('id', ParseIntPipe) id: number) {
        return this.individualClientService.getAdminOneIndividual(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('individuals/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneIndividual(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.individualClientService.updateAdminOneIndividual(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }

    // companies
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('companies')
    async getCompanies(@Query() query: GetUsersDto) {
        return this.companyClientService.getCompanies(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('companies/:id')
    async getAdminOneCompany(@Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.getAdminOneCompany(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('companies/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneCompany(@Param('id', ParseIntPipe) id: number, @Body() updateAdminCompanyDto: UpdateAdminCompanyDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.companyClientService.updateAdminOneCompany(id, updateAdminCompanyDto, images);
    }

    // technicians
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('technicians')
    async getTechnicians(@Query() query: GetUsersDto) {
        return this.technicianService.getTechnicians(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('technicians/:id')
    async getAdminOneTechnician(@Param('id', ParseIntPipe) id: number) {
        return this.technicianService.getAdminOneTechnician(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('technicians/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneTechnician(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.technicianService.updateAdminOneTechnician(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }


    // deliveries
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('deliveries')
    async getDeliveries(@Query() query: GetUsersDto) {
        return this.deliveryService.getDeliveries(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('deliveries/:id')
    async getAdminOneDelivery(@Param('id', ParseIntPipe) id: number) {
        return this.deliveryService.getAdminOneDelivery(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('deliveries/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneDelivery(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.deliveryService.updateAdminOneDelivery(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }

    // orders
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('orders')
    async getAdminOrders(@Query() query: GetOrdersDto) {
        return this.orderService.getAdminOrders(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('orders/:id')
    async getAdminOneOrder(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.getAdminOneOrder(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('orders/:id')
    async updateAdminOneOrder(@Param('id', ParseIntPipe) id: number, @Body() updateAdminOrderDto: UpdateAdminOrderDto) {
        return this.orderService.updateAdminOneOrder(id, updateAdminOrderDto);
    }

    // categories
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('category')
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.createCategory(createCategoryDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('categories')
    async getCategories(@Query() query: GetCategoriesDto) {
        return this.categoryService.getCategories(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('categories/:id')
    async getOneCategory(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getOneCategory(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('categories/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateOneCategory(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.categoryService.updateOneCategory(id, updateCategoryDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('categories/:id')
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.deleteCategory(id);
    }

    // faqs
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('faq')
    async createFaq(@Body() createFaqDto: CreateFaqDto) {
        return this.faqService.createFaq(createFaqDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('faqs')
    async getFaqs(@Query() query: GetFaqsDto) {
        return this.faqService.getFaqs(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('faqs/:id')
    async getOneFaq(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.getOneFaq(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('faqs/:id')
    async updateOneFaq(@Param('id', ParseIntPipe) id: number, @Body() updateFaqDto: UpdateFaqDto) {
        return this.faqService.updateOneFaq(id, updateFaqDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('faqs/:id')
    async deleteFaq(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.deleteFaq(id);
    }

    // reviews
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('reviews')
    async getAdminReviews(@Query() query: GetReviewsDto) {
        return this.reviewsService.getAdminReviews(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('reviews/:id')
    async getAdminOneReview(@Param('id', ParseIntPipe) id: number) {
        return this.reviewsService.getAdminOneReview(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('reviews/:id')
    async updateAdminOneReview(@Param('id', ParseIntPipe) id: number, @Body() updateReviewDto: UpdateReviewDto) {
        return this.reviewsService.updateAdminOneReview(id, updateReviewDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('reviews/:id')
    async deleteAdminReview(@Param('id', ParseIntPipe) id: number) {
        return this.reviewsService.deleteAdminReview(id);
    }

    // branches
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('create-branch')
    async createBranch(@Body() createBranchDto: CreateBranchDto) {
        return this.branchesService.createBranch(createBranchDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('branches')
    async getBranches(@Query() query: GetBranchesDto) {
        return this.branchesService.getBranches(query);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('branches/:id')
    async getOneBranch(@Param('id', ParseIntPipe) id: number) {
        return this.branchesService.getOneBranch(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('branches/:id')
    async updateOneBranch(@Param('id', ParseIntPipe) id: number, @Body() updateBranchDto: UpdateBranchDto) {
        return this.branchesService.updateOneBranch(id, updateBranchDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('branches/:id')
    async deleteBranch(@Param('id', ParseIntPipe) id: number) {
        return this.branchesService.deleteBranch(id);
    }

    // statistics
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('user-registration-stats')
    async getUserRegistrationStats() {
        return this.baseUserService.getUserRegistrationStats();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('used-devices-stats')
    async getUsedDevicesStats() {
        return this.baseUserService.getUsedDevicesStats();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('order-stats')
    async getOrderStats() {
        return this.orderService.getOrderStats();
    }

    // notifications
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('notifications')
    async getNotifications(@Query() query: GetNotificationsDto) {
        return this.notificationsService.getNotifications(query, "admin");
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification("admin", id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('notifications/unread')
    async getUnreadNotificationsCount() {
        return this.notificationsService.getUnreadNotificationsCount("admin");
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('notifications/read-all')
    async readAllNotifications() {
        return this.notificationsService.readAllNotifications("admin");
    }

    // transactions
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('transactions')
    async getTransactions(@Query() query: GetTransactionsDto) {
        return this.transactionsService.getTransactions(query);
    }
}
