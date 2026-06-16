import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Notification, NotificationFor, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        private gateway: NotificationsGateway,
    ) { }

    async sendNotification(
        message: string,
        type: NotificationType,
        forRole: NotificationFor,
        forId: number | undefined,
        relations?: {
            user_id?: number;
            user_role?: NotificationFor;
            order_id?: number;
            review_id?: number;
        }
    ) {
        const notification = this.notificationRepo.create({
            message,
            type,
            for: forRole,
            forId,
            ...relations,
        });

        this.notificationRepo.save(notification);

        // send signal to exact user
        this.gateway.server.emit(`notification:${forRole}:${forId}`, { type: type });

        return true
    }

    async getNotifications(dto: GetNotificationsDto, role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery', userId?: number) {
        const { page = 1, limit = 10, type, search, from, to } = dto;

        const qb = this.notificationRepo
            .createQueryBuilder('notification')
            .where('notification.for = :role', { role })
            .orderBy('notification.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (userId) {
            qb.andWhere('notification.forId = :userId', { userId });
        }

        if (type) {
            qb.andWhere('notification.type = :type', { type });
        }

        if (search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('notification.message ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        if (from && to) {
            qb.andWhere('notification.created_at BETWEEN :from AND :to', { from, to });
        } else if (from) {
            qb.andWhere('notification.created_at >= :from', { from });
        } else if (to) {
            qb.andWhere('notification.created_at <= :to', { to });
        }

        const [notifications, total] = await qb.getManyAndCount();

        return {
            data: notifications,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async readNotification(
        role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery',
        id: number,
    ) {
        const notification = await this.notificationRepo.findOne({
            where: { for: role, id },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        // Merge updates
        this.notificationRepo.merge(notification, {
            read: true
        });

        await this.notificationRepo.save(notification);

        return {
            message: 'Notification read successfully',
        };
    }

    async getUnreadNotificationsCount(role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery', userId?: number) {
        const notifications = await this.notificationRepo.find({
            where: { for: role, forId: userId, read: false },
        });

        return notifications.length;
    }

    async readAllNotifications(role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery', userId?: number) {
        const where: any = { for: role, read: false };
        if (userId) {
            where.forId = userId;
        }

        await this.notificationRepo.update(where, { read: true });

        return {
            message: 'All Notification read successfully',
        };
    }
}
