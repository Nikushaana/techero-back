import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { getDistanceFromLatLonInKm } from 'src/common/utils/geo.utils';
import { instanceToPlain } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/address/entities/address.entity';
import { Order } from './entities/order.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UpdateUserOrderDto } from './dto/update-user-order.dto';
import { UpdateAdminOrderDto } from './dto/update-admin-order.dto';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { BranchesService } from 'src/branches/branches.service';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { RepairDecision, RepairDecisionDto } from './dto/repair-decision.dto';
import { OrderType } from 'src/common/types/order-type.enum';
import { TechnicianRequestPaymentDto } from './dto/technician-request-payment.dto';
import { OrderTypeLabelsGeorgian } from 'src/common/labels/order-type-labels';
import { OrderStatusLabelsGeorgian } from 'src/common/labels/order-status-labels';
import { PricingService } from 'src/pricing/pricing.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/common/types/transaction-type.enum';
import { PaymentProvider } from 'src/common/types/payment-provider.enum';
import { PaymentService } from 'src/payment/payment.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { GetOrdersDto } from './dto/get-orders.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { InvoiceType } from 'src/invoice/entities/invoice.entity';
import { UploadsService } from 'src/common/uploads/uploads.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

        private readonly baseUserService: BaseUserService,

        private readonly notificationService: NotificationsService,

        private readonly branchesService: BranchesService,

        private readonly pricingService: PricingService,

        private readonly transactionsService: TransactionsService,

        private readonly paymentService: PaymentService,

        private readonly invoiceService: InvoiceService,

        private readonly uploadsService: UploadsService,
    ) { }

    // order status changes
    private assertStatus(
        current: OrderStatus,
        allowed: OrderStatus[],
        action: string
    ) {
        if (!allowed.includes(current)) {
            throw new BadRequestException(
                `Cannot ${action} when order status is "${current}"`
            );
        }
    }

    // order status update notification
    private async notifyOrderStatusUpdate(
        order: Order,
        roles: Array<{ role: "admin" | "company" | "individual" | "delivery" | "technician"; id?: number }>
    ) {
        if (!roles.length) return;

        const label = OrderStatusLabelsGeorgian[order.status] || order.status;

        for (const r of roles) {
            await this.notificationService.sendNotification(
                `შეკვეთა №${order.id}: ${label}.`,
                NotificationType.ORDER_UPDATED,
                r.role,
                r.id,
                { order_id: order.id }
            );
        }
    }

    // order service type update notification
    private async notifyOrderServiceTypeUpdate(
        order: Order,
        roles: Array<{ role: "admin" | "company" | "individual" | "delivery" | "technician"; id?: number }>
    ) {
        const label = OrderTypeLabelsGeorgian[order.service_type] || order.service_type;

        for (const r of roles) {
            await this.notificationService.sendNotification(
                `შეკვეთა №${order.id}: ახალი სერვისის ტიპი - ${label}.`,
                NotificationType.ORDER_UPDATED,
                r.role,
                r.id,
                { order_id: order.id }
            );
        }
    }

    // individual and company
    async createOrder(userId: number, repo: any, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.baseUserService.getUser(userId, repo);

        const category = await this.categoryRepo.findOne({ where: { id: createOrderDto.categoryId, status: true } });
        if (!category) throw new NotFoundException('Category not found');

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({ where: { id: createOrderDto.addressId, [relationKey]: { id: userId } } });
        if (!address) throw new NotFoundException('Address not found');

        const branches = await this.branchesService.getBranches({ page: 1 });
        if (!branches.total) throw new BadRequestException('No branches available — cannot add order');

        // Check if location is within any branch coverage
        const isWithinCoverage = branches?.data?.some((branch) => {
            const distance = getDistanceFromLatLonInKm(
                address.location.lat,
                address.location.lng,
                branch.location.lat,
                branch.location.lng
            );
            return distance <= branch.coverage_radius_km;
        });

        if (!isWithinCoverage) {
            throw new BadRequestException(
                'Address is outside all branch coverage areas. Please choose a closer location.'
            );
        }

        const order = this.orderRepo.create({
            ...createOrderDto,
            category,
            address
        });

        if ("companyName" in user) {
            order.company = user;
        } else {
            order.individual = user;
        }

        await this.orderRepo.save(order);

        // Upload media if any
        let newUploadedImagesUrls: string[] = [];
        let newUploadedVideosUrls: string[] = [];

        if ((images && images.length > 0) || (videos && videos.length > 0)) {
            const subFolder = `orders/${order.id}`;

            if (images.length > 0) {
                newUploadedImagesUrls = await Promise.all(
                    images.map((file) => this.uploadsService.uploadImage(file, subFolder))
                );
            }

            if (videos.length > 0) {
                newUploadedVideosUrls = await Promise.all(
                    videos.map((file) => this.uploadsService.uploadVideo(file, subFolder))
                );
            }

            order.images = newUploadedImagesUrls;
            order.videos = newUploadedVideosUrls;

            await this.orderRepo.save(order);
        }

        // Calculate price
        const { price } = await this.pricingService.calculatePrice({
            addressId: createOrderDto.addressId,
            service_type: createOrderDto.service_type,
        });

        const serviceTypeLabel =
            OrderTypeLabelsGeorgian[order.service_type] || order.service_type;

        // Create invoice
        const invoice = await this.invoiceService.createInvoice({
            orderId: order.id,
            amount: price,
            type: InvoiceType.CREATE_ORDER,
        });

        // Create transaction for this order creating
        const transaction = await this.transactionsService.createTransaction({
            amount: price,
            reason: `შეკვეთა №${order.id} შექმნისთვის გადახდა`,
            type: TransactionType.DEBIT,
            provider: PaymentProvider.BOG,
            individualId: "companyName" in user ? undefined : user.id,
            companyId: "companyName" in user ? user.id : undefined,
            orderId: order.id
        });

        // send notification to admin
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: დაემატა "${serviceTypeLabel}"-ს შესახებ და მომსახურების დასაწყებად საჭიროა გადახდა.`,
            NotificationType.NEW_ORDER,
            'admin',
            undefined,
            {
                order_id: order.id
            },
        );

        // send notification to user
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: დაემატა "${serviceTypeLabel}"-ს შესახებ და მომსახურების დასაწყებად საჭიროა გადახდა.`,
            NotificationType.NEW_ORDER,
            user.role,
            userId,
            {
                order_id: order.id
            },
        );

        // mocked payment
        await this.paymentService.mockPayOrder(transaction.id, invoice.id);

        return { message: `Order created successfully`, order: instanceToPlain(order) };
    }

    async getOrders(dto: GetOrdersDto, userId: number, repo: any) {
        const { page = 1, limit = 10, service_type, search, from, to } = dto;

        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.category', 'category')
            .where(`order.${relationKey} = :userId`, { userId })
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (service_type) qb.andWhere('order.service_type = :service_type', { service_type });

        if (search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.orWhere('category.name ILIKE :search')
                        .orWhere('brand ILIKE :search')
                        .orWhere('model ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        if (from && to) {
            qb.andWhere('order.created_at BETWEEN :from AND :to', { from, to });
        } else if (from) {
            qb.andWhere('order.created_at >= :from', { from });
        } else if (to) {
            qb.andWhere('order.created_at <= :to', { to });
        }

        const [orders, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(orders),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getOneOrderEntity(userId: number, id: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
            relations: ['company', 'individual', 'technician', 'delivery', 'invoices'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getOneOrder(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);
        return instanceToPlain(order);
    }

    async updateOneOrder(userId: number, id: number, repo: any, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.PENDING_CREATION_PAYMENT) {
            throw new BadRequestException('Only processing or pending_creation_payment orders can be updated');
        }

        if (updateUserOrderDto.categoryId) {
            const category = await this.categoryRepo.findOne({
                where: { id: updateUserOrderDto.categoryId, status: true },
            });
            if (!category) throw new NotFoundException('Category not found');
            order.category = category;
        }

        // Handle deleted media
        let imagesToDeleteArray: string[] = [];
        let videosToDeleteArray: string[] = [];

        if (updateUserOrderDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateUserOrderDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        if (updateUserOrderDto.videosToDelete) {
            try {
                videosToDeleteArray = JSON.parse(updateUserOrderDto.videosToDelete);
            } catch (err) {
                throw new BadRequestException('videosToDeleteArray must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray and videosToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (relativeUrl) => {
                    // remove the file physically from the volume
                    await this.uploadsService.deleteFile(relativeUrl).catch(err => {
                        console.error(`Failed to delete file from volume: ${relativeUrl}`, err);
                    })
                }),
            );
        }
        if (videosToDeleteArray.length > 0) {
            await Promise.all(
                videosToDeleteArray.map(async (relativeUrl) => {
                    // remove the file physically from the volume
                    await this.uploadsService.deleteFile(relativeUrl).catch(err => {
                        console.error(`Failed to delete file from volume: ${relativeUrl}`, err);
                    })
                }),
            );
        }

        // Compute remaining items
        const remainingImages = (order.images || []).filter((img) => !imagesToDeleteArray.includes(img));
        const remainingVideos = (order.videos || []).filter((vid) => !videosToDeleteArray.includes(vid));

        // Merge with existing media but respect total limits
        const MAX_IMAGES = 3;
        const MAX_VIDEOS = 1;
        const newImageCount = images?.length || 0;
        const newVideoCount = videos?.length || 0;
        const totalImages = remainingImages.length + newImageCount;
        const totalVideos = remainingVideos.length + videos.length;

        if (totalImages > 3) {
            throw new BadRequestException(`Allowed max ${MAX_IMAGES} image. (exists: ${remainingImages.length}, new: ${newImageCount})`);
        }

        if (totalVideos > 1) {
            throw new BadRequestException(`Allowed max ${MAX_VIDEOS} video. (exists: ${remainingVideos.length}, new: ${newVideoCount})`);
        }

        let newUploadedImagesUrls: string[] = [];
        let newUploadedVideosUrls: string[] = [];

        if (images && images.length > 0) {
            const subFolder = `orders/${id}`;

            newUploadedImagesUrls = await Promise.all(
                images.map((file) => this.uploadsService.uploadImage(file, subFolder))
            );
        }
        if (videos && videos.length > 0) {
            const subFolder = `orders/${id}`;

            newUploadedVideosUrls = await Promise.all(
                videos.map((file) => this.uploadsService.uploadVideo(file, subFolder))
            );
        }

        const { categoryId, ...rest } = updateUserOrderDto;
        const updatedOrder = this.orderRepo.merge(order, rest);

        updatedOrder.images = [...remainingImages, ...newUploadedImagesUrls];
        updatedOrder.videos = [...remainingVideos, ...newUploadedVideosUrls];

        await this.orderRepo.save(updatedOrder);

        return {
            message: 'Order updated successfully',
            order,
        };
    }

    // admin
    async getAdminOrders(dto: GetOrdersDto) {
        const { page = 1, limit = 10, service_type, status, search, from, to } = dto;

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.individual', 'individual')
            .leftJoinAndSelect('order.company', 'company')
            .leftJoinAndSelect('order.technician', 'technician')
            .leftJoinAndSelect('order.delivery', 'delivery')
            .leftJoinAndSelect('order.category', 'category')
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (service_type) qb.andWhere('order.service_type = :service_type', { service_type });
        if (status) qb.andWhere('order.status = :status', { status });

        if (search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('individual.phone ILIKE :search')
                        .orWhere('individual.name ILIKE :search')
                        .orWhere('individual.lastName ILIKE :search')
                        .orWhere('company.phone ILIKE :search')
                        .orWhere('company.companyAgentName ILIKE :search')
                        .orWhere('company.companyAgentLastName ILIKE :search')
                        .orWhere('company.companyName ILIKE :search')
                        .orWhere('category.name ILIKE :search')
                        .orWhere('brand ILIKE :search')
                        .orWhere('model ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        if (from && to) {
            qb.andWhere('order.created_at BETWEEN :from AND :to', { from, to });
        } else if (from) {
            qb.andWhere('order.created_at >= :from', { from });
        } else if (to) {
            qb.andWhere('order.created_at <= :to', { to });
        }

        const [orders, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(orders),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findAdminOneOrderEntity(id: number) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['individual', 'company', 'technician', 'delivery', 'invoices'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getAdminOneOrder(id: number) {
        const order = await this.findAdminOneOrderEntity(id)

        return instanceToPlain(order)
    }

    async updateAdminOneOrder(id: number, updateAdminOrderDto: UpdateAdminOrderDto) {
        const order = await this.findAdminOneOrderEntity(id)

        if (
            updateAdminOrderDto.status !== undefined &&
            updateAdminOrderDto.status === order.status
        ) {
            throw new BadRequestException(
                'The new status must be different from the current status.'
            );
        }

        const { technicianId, deliveryId, ...rest } = updateAdminOrderDto;

        const oldDelivery = order.delivery;
        const oldTechnician = order.technician;
        const oldStatus = order.status;
        const oldServiceType = order.service_type;

        if (technicianId) {
            const technician = await this.technicianRepo.findOne({
                where: { id: technicianId, status: true }
            });
            if (!technician) throw new NotFoundException('Technician not found or inactive');

            if (oldTechnician?.id !== technicianId) {
                // send notification to admin
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldTechnician?.id
                        ? `დაენიშნა ახალი ტექნიკოსი — ${technician.name} ${technician.lastName}, ${oldTechnician?.name} ${oldTechnician?.lastName}-ს ნაცვლად`
                        : `დაენიშნა ტექნიკოსი ${technician.name + " " + technician.lastName}`}`,
                    NotificationType.ORDER_UPDATED,
                    'admin',
                    undefined,
                    {
                        order_id: order.id
                    },
                );
                {
                    oldTechnician?.id &&
                        // send notification to old technician
                        await this.notificationService.sendNotification(
                            `შეკვეთა №${order.id}: აღარ არის შენს სახელზე.`,
                            NotificationType.ORDER_UPDATED,
                            'technician',
                            oldTechnician?.id,
                        );
                }
                // send notification to new technician
                await this.notificationService.sendNotification(
                    `შენ გაქვს ახალი შეკვეთა — №${order.id}.`,
                    NotificationType.ORDER_UPDATED,
                    'technician',
                    technician.id,
                    {
                        order_id: order.id
                    },
                );
                // send notification to user
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldTechnician?.id
                        ? `დაენიშნა ახალი ტექნიკოსი — ${technician.name} ${technician.lastName}, ${oldTechnician?.name} ${oldTechnician?.lastName}-ს ნაცვლად`
                        : `დაენიშნა ტექნიკოსი ${technician.name + " " + technician.lastName}`}`,
                    NotificationType.ORDER_UPDATED,
                    `${order.company?.id ? "company" : "individual"}`,
                    order.company?.id || order.individual?.id,
                    {
                        order_id: order.id
                    },
                );
            }

            order.technician = technician;
        }

        if (deliveryId) {
            const delivery = await this.deliveryRepo.findOne({
                where: { id: deliveryId, status: true }
            });
            if (!delivery) throw new NotFoundException('Delivery not found or inactive');

            if (oldDelivery?.id !== deliveryId) {
                // send notification to admin
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldDelivery?.id
                        ? `დაენიშნა ახალი კურიერი — ${delivery.name} ${delivery.lastName}, ${oldDelivery.name} ${oldDelivery.lastName}-ს ნაცვლად`
                        : `დაენიშნა კურიერი ${delivery.name + " " + delivery.lastName}`}`,
                    NotificationType.ORDER_UPDATED,
                    'admin',
                    undefined,
                    {
                        order_id: order.id
                    },
                );
                {
                    oldDelivery?.id &&
                        // send notification to old delivery
                        await this.notificationService.sendNotification(
                            `შეკვეთა №${order.id}: აღარ არის შენს სახელზე.`,
                            NotificationType.ORDER_UPDATED,
                            'delivery',
                            oldDelivery?.id,
                        );
                }
                // send notification to new delivery
                await this.notificationService.sendNotification(
                    `შენ გაქვს ახალი შეკვეთა — №${order.id}.`,
                    NotificationType.ORDER_UPDATED,
                    'delivery',
                    delivery.id,
                    {
                        order_id: order.id
                    },
                );
                // send notification to user
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldDelivery?.id
                        ? `დაენიშნა ახალი კურიერი — ${delivery.name} ${delivery.lastName}, ${oldDelivery.name} ${oldDelivery.lastName}-ს ნაცვლად`
                        : `დაენიშნა კურიერი ${delivery.name + " " + delivery.lastName}`}.`,
                    NotificationType.ORDER_UPDATED,
                    `${order.company?.id ? "company" : "individual"}`,
                    order.company?.id || order.individual?.id,
                    {
                        order_id: order.id
                    },
                );
            }

            order.delivery = delivery;
        }

        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        if (updateAdminOrderDto.status !== oldStatus) {
            // sent status notifications
            await this.notifyOrderStatusUpdate(order, [
                { role: 'admin' },
                { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
                ...((order.delivery?.id && oldDelivery?.id) ? [{ role: 'delivery' as const, id: order.delivery?.id }] : []),
                ...((order.technician?.id && oldTechnician?.id) ? [{ role: 'technician' as const, id: order.technician?.id }] : []),
            ]);
        }

        if (updateAdminOrderDto.service_type !== oldServiceType) {
            // sent service type notifications
            await this.notifyOrderServiceTypeUpdate(order, [
                { role: 'admin' },
                { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
                ...((order.delivery?.id && oldDelivery?.id) ? [{ role: 'delivery' as const, id: order.delivery?.id }] : []),
                ...((order.technician?.id && oldTechnician?.id) ? [{ role: 'technician' as const, id: order.technician?.id }] : []),
            ]);
        }

        return {
            message: `Order updated successfully`,
            order: instanceToPlain(order),
        };
    }

    async getOrderStats() {
        const orders = await this.orderRepo.find();

        const ordersByMonth = orders.reduce((acc, order) => {
            const date = new Date(order.created_at);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            acc[yearMonth] = (acc[yearMonth] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const stats = Object.keys(ordersByMonth)
            .sort()
            .map((month) => ({
                date: month,
                orders: ordersByMonth[month],
            }));

        return stats;
    }

    // delivery
    async getDeliveryOrders(dto: GetOrdersDto, deliveryId: number) {
        const { page = 1, limit = 10, service_type, search, from, to } = dto;

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.individual', 'individual')
            .leftJoinAndSelect('order.company', 'company')
            .leftJoinAndSelect('order.technician', 'technician')
            .leftJoinAndSelect('order.category', 'category')
            .where(`order.delivery = :deliveryId`, { deliveryId })
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (service_type) qb.andWhere('order.service_type = :service_type', { service_type });

        if (search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('individual.phone ILIKE :search')
                        .orWhere('individual.name ILIKE :search')
                        .orWhere('individual.lastName ILIKE :search')
                        .orWhere('company.phone ILIKE :search')
                        .orWhere('company.companyAgentName ILIKE :search')
                        .orWhere('company.companyAgentLastName ILIKE :search')
                        .orWhere('company.companyName ILIKE :search')
                        .orWhere('category.name ILIKE :search')
                        .orWhere('brand ILIKE :search')
                        .orWhere('model ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        if (from && to) {
            qb.andWhere('order.created_at BETWEEN :from AND :to', { from, to });
        } else if (from) {
            qb.andWhere('order.created_at >= :from', { from });
        } else if (to) {
            qb.andWhere('order.created_at <= :to', { to });
        }

        const [orders, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(orders),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findDeliveryOneOrderEntity(deliveryId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, delivery: { id: deliveryId } },
            relations: ['individual', 'company', 'technician'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getDeliveryOneOrder(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        return instanceToPlain(order)
    }

    // technician
    async getTechnicianOrders(dto: GetOrdersDto, technicianId: number) {
        const { page = 1, limit = 10, service_type, search, from, to } = dto;

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.individual', 'individual')
            .leftJoinAndSelect('order.company', 'company')
            .leftJoinAndSelect('order.delivery', 'delivery')
            .leftJoinAndSelect('order.category', 'category')
            .where(`order.technician = :technicianId`, { technicianId })
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (service_type) qb.andWhere('order.service_type = :service_type', { service_type });

        if (search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('individual.phone ILIKE :search')
                        .orWhere('individual.name ILIKE :search')
                        .orWhere('individual.lastName ILIKE :search')
                        .orWhere('company.phone ILIKE :search')
                        .orWhere('company.companyAgentName ILIKE :search')
                        .orWhere('company.companyAgentLastName ILIKE :search')
                        .orWhere('company.companyName ILIKE :search')
                        .orWhere('category.name ILIKE :search')
                        .orWhere('brand ILIKE :search')
                        .orWhere('model ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        if (from && to) {
            qb.andWhere('order.created_at BETWEEN :from AND :to', { from, to });
        } else if (from) {
            qb.andWhere('order.created_at >= :from', { from });
        } else if (to) {
            qb.andWhere('order.created_at <= :to', { to });
        }

        const [orders, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(orders),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findTechnicianOneOrderEntity(technicianId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, technician: { id: technicianId } },
            relations: ['individual', 'company', 'delivery'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getTechnicianOneOrder(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        return instanceToPlain(order)
    }

    // order status flow

    // delivery
    async startPickup(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        if (order.service_type !== OrderType.FIX_OFF_SITE) {
            throw new BadRequestException(
                `Pickup is only allowed for off-site service orders. Current type: "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.ASSIGNED],
            'start pickup'
        );

        order.status = OrderStatus.PICKUP_STARTED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Pickup started successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async pickedUp(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.PICKUP_STARTED],
            'mark as picked up'
        );

        order.status = OrderStatus.PICKED_UP;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Picked up successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async toTechnician(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.PICKED_UP],
            'send technic to technician'
        );

        order.status = OrderStatus.TO_TECHNICIAN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Technic sent to technician successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async deliveredToTechnician(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TO_TECHNICIAN],
            'deliver technic to technician'
        );

        order.status = OrderStatus.DELIVERED_TO_TECHNICIAN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
            { role: 'technician', id: order.technician?.id },
        ]);

        return {
            message: 'Technic delivered to technician successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async inspection(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.DELIVERED_TO_TECHNICIAN],
            'start inspection'
        );

        order.status = OrderStatus.INSPECTION;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: order.delivery?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Inspection started successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async waitingDecision(technicianId: number, id: number, technicianRequestPaymentDto: TechnicianRequestPaymentDto) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.INSPECTION],
            'request repair decision'
        );

        order.payment_amount = technicianRequestPaymentDto.payment_amount;
        order.payment_reason = technicianRequestPaymentDto.payment_reason;
        order.status = OrderStatus.WAITING_DECISION;

        await this.orderRepo.save(order)

        const existing = order.invoices?.find(
            (inv) => inv.type === InvoiceType.REPAIR_ORDER
        );

        if (!existing) {
            await this.invoiceService.createInvoice({
                orderId: order.id,
                amount: order.payment_amount,
                type: InvoiceType.REPAIR_ORDER,
            });
        }

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Waiting for user repair decision',
            order: instanceToPlain(order),
        };
    }
    // user
    async decideRepair(userId: number, id: number, repo: any, repairDecisionDto: RepairDecisionDto) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.WAITING_DECISION],
            `make a repair decision`
        );

        order.status = repairDecisionDto.decision == RepairDecision.APPROVE ? OrderStatus.PENDING_REPAIRING_OFF_SITE_PAYMENT : OrderStatus.REPAIR_CANCELLED;

        if (repairDecisionDto.decision === 'cancel') {
            if (!repairDecisionDto.reason) {
                throw new BadRequestException('Cancel reason is required when rejecting the repair.');
            }
            order.cancel_reason = repairDecisionDto.reason;
        }

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            ...(repairDecisionDto.decision === RepairDecision.CANCEL
                ? [{ role: 'technician' as const, id: order.technician?.id }]
                : []),
        ]);

        if (repairDecisionDto.decision == "approve") {
            // Create transaction for this order repair approve
            const transaction = await this.transactionsService.createTransaction({
                amount: order.payment_amount,
                reason: `შეკვეთა №${order.id} შეკეთებისთვის გადახდა`,
                type: TransactionType.DEBIT,
                provider: PaymentProvider.BOG,
                individualId: order.individual?.id ?? null,
                companyId: order.company?.id ?? null,
                orderId: order.id
            });

            const secondInvoice = order.invoices?.find(
                (invoice) => invoice.type === InvoiceType.REPAIR_ORDER
            );

            if (!secondInvoice) {
                throw new NotFoundException('Second invoice not found');
            }

            // mocked payment
            await this.paymentService.mockPayOrder(transaction.id, secondInvoice.id);
        }

        return {
            message: repairDecisionDto.decision === 'approve'
                ? 'Waiting payment for repairing off site'
                : 'Repair cancelled successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async brokenReady(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIR_CANCELLED],
            'mark as broken ready'
        );

        order.status = OrderStatus.BROKEN_READY;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Broken technic is ready to return',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returningBroken(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.BROKEN_READY],
            'mark as returning broken'
        );

        order.status = OrderStatus.RETURNING_BROKEN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: order.technician?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Broken technic is returning successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returnedBroken(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNING_BROKEN],
            'mark as returned broken'
        );

        order.status = OrderStatus.RETURNED_BROKEN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Broken technic returned successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async cancelled(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNED_BROKEN],
            `mark as cancelled`
        );

        order.status = OrderStatus.CANCELLED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: `Order Cancelled successfully`,
            order: instanceToPlain(order),
        };
    }
    // technician
    async fixedReady(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIRING_OFF_SITE],
            'mark as fixed ready'
        );

        order.status = OrderStatus.FIXED_READY;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Fixed technic is ready to return',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returningFixed(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.FIXED_READY],
            'mark as returning fixed'
        );

        order.status = OrderStatus.RETURNING_FIXED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: order.technician?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Fixed technic is returning successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returnedFixed(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNING_FIXED],
            'mark as returned fixed'
        );

        order.status = OrderStatus.RETURNED_FIXED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Fixed technic returned successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async completed(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNED_FIXED],
            `mark as completed`
        );

        order.status = OrderStatus.COMPLETED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: `Off-site service completed successfully.`,
            order: instanceToPlain(order),
        };
    }
    // technician
    async technicianComing(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.FIX_ON_SITE && order.service_type !== OrderType.INSTALLATION) {
            throw new BadRequestException(
                `Technician visit is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.ASSIGNED],
            'mark as technician coming'
        );

        order.status = OrderStatus.TECHNICIAN_COMING;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Technician coming successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async repairingOnSite(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.FIX_ON_SITE) {
            throw new BadRequestException(
                `On-site repair is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TECHNICIAN_COMING],
            'mark as repairing on site'
        );

        order.status = OrderStatus.REPAIRING_ON_SITE;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Repairing on site goes successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async installing(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.INSTALLATION) {
            throw new BadRequestException(
                `Installation is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TECHNICIAN_COMING],
            'mark as installing'
        );

        order.status = OrderStatus.INSTALLING;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Installing goes successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async waitingPayment(technicianId: number, id: number, technicianRequestPaymentDto: TechnicianRequestPaymentDto) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIRING_ON_SITE, OrderStatus.INSTALLING],
            'request payment'
        );

        order.payment_amount = technicianRequestPaymentDto.payment_amount;
        order.payment_reason = technicianRequestPaymentDto.payment_reason;
        order.status = OrderStatus.WAITING_PAYMENT;

        await this.orderRepo.save(order)

        await this.invoiceService.createInvoice({
            orderId: order.id,
            amount: order.payment_amount,
            type: InvoiceType.SERVICE_ONSITE,
        });

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Payment request sent successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async completedOnSite(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.WAITING_PAYMENT],
            `start payment`
        );

        order.status = OrderStatus.PENDING_ON_SITE_PAYMENT;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'technician', id: order.technician?.id }
        ]);

        // Create transaction for this order repair approve
        const transaction = await this.transactionsService.createTransaction({
            amount: order.payment_amount,
            reason: `შეკვეთა №${order.id} ${order.service_type === OrderType.INSTALLATION ? "ინსტალაციის" : "შეკეთების"} გადასახადი`,
            type: TransactionType.DEBIT,
            provider: PaymentProvider.BOG,
            individualId: order.individual?.id ?? null,
            companyId: order.company?.id ?? null,
            orderId: order.id
        });

        const onSiteInvoice = order.invoices?.find(
            (invoice) => invoice.type === InvoiceType.SERVICE_ONSITE
        );

        if (!onSiteInvoice) {
            throw new NotFoundException('On-site invoice not found');
        }

        // mocked payment
        await this.paymentService.mockPayOrder(transaction.id, onSiteInvoice.id);

        return {
            message: `Waiting payment to Complete on site successfully`,
            order: instanceToPlain(order),
        };
    }
}
