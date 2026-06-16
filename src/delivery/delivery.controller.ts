import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { RequestInfo } from 'src/common/types/request-info';
import { OrderService } from 'src/order/order.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { GetNotificationsDto } from 'src/notifications/dto/get-notifications.dto';
import { GetOrdersDto } from 'src/order/dto/get-orders.dto';

@Controller('delivery')
export class DeliveryController {
    constructor(
        private readonly deliveryService: DeliveryService,

        private readonly orderService: OrderService,

        private readonly notificationsService: NotificationsService
    ) { }

    // delivery

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateDelivery(@Req() req: RequestInfo, @Body() updateTechnicianDto: UpdateDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.deliveryService.updateDelivery(req.user.id, updateTechnicianDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.deliveryService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.deliveryService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.deliveryService.changeNumber(req.user.id, changeNumberDto);
    }

    // order
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('orders')
    async getDeliveryOrders(@Query() query: GetOrdersDto, @Req() req: RequestInfo) {
        return this.orderService.getDeliveryOrders(query, req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('orders/:id')
    async getDeliveryOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.getDeliveryOneOrder(req.user.id, id);
    }
    
    // order flow
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/pickup-started')
    async startPickup(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.startPickup(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/picked-up')
    async pickedUp(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.pickedUp(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/delivered-to-technician')
    async deliveredToTechnician(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.deliveredToTechnician(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/returning-broken')
    async returningBroken(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.returningBroken(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/returned-broken')
    async returnedBroken(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.returnedBroken(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/returning-fixed')
    async returningFixed(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.returningFixed(req.user.id, id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('orders/:id/returned-fixed')
    async returnedFixed(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.returnedFixed(req.user.id, id);
    }

    // notifications
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('notifications')
    async getNotifications(@Req() req: RequestInfo, @Query() query: GetNotificationsDto) {
        return this.notificationsService.getNotifications(query, "delivery", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification("delivery", id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('notifications/unread')
    async getUnreadNotificationsCount(@Req() req: RequestInfo) {
        return this.notificationsService.getUnreadNotificationsCount("delivery", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Post('notifications/read-all')
    async readAllNotifications(@Req() req: RequestInfo) {
        return this.notificationsService.readAllNotifications("delivery", req.user.id);
    }
}
