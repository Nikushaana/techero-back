import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) { }

    async createTransaction(dto: CreateTransactionDto) {
        const transaction = this.transactionRepo.create({
            amount: dto.amount,
            type: dto.type,
            reason: dto.reason,
            provider: dto.provider,
            individual: dto.individualId ? { id: dto.individualId } as any : undefined,
            company: dto.companyId ? { id: dto.companyId } as any : undefined,
            order: dto.orderId ? { id: dto.orderId } as any : undefined,
        });

        return await this.transactionRepo.save(transaction);
    }

    async getUserTransactions(dto: GetTransactionsDto, role: 'individual' | 'company', userId: number) {
        const { page = 1, limit = 10, type, status, search } = dto;

        const qb = this.transactionRepo
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.order', 'order')
            .where(`transaction.${role} = :userId`, { userId })
            .orderBy('transaction.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (type) {
            qb.andWhere('transaction.type = :type', { type });
        }

        if (status) {
            qb.andWhere('transaction.status = :status', { status });
        }

        if (search?.trim()) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.orWhere('transaction.reason ILIKE :search');
                }),
                { search: `%${search}%` }
            );
        }

        const [transactions, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(transactions),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTransactions(dto: GetTransactionsDto) {
        const { page = 1, limit = 10, type, status, search } = dto;

        const qb = this.transactionRepo
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.company', 'company')
            .leftJoinAndSelect('transaction.individual', 'individual')
            .leftJoinAndSelect('transaction.order', 'order')
            .orderBy('transaction.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (type) {
            qb.andWhere('transaction.type = :type', { type });
        }

        if (status) {
            qb.andWhere('transaction.status = :status', { status });
        }

        if (search?.trim()) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.orWhere('transaction.reason ILIKE :search')
                        .orWhere('company.companyName ILIKE :search')
                        .orWhere('company.companyAgentName ILIKE :search')
                        .orWhere('company.companyAgentLastName ILIKE :search')
                        .orWhere('company.companyIdentificationCode ILIKE :search')
                        .orWhere('individual.phone ILIKE :search')
                        .orWhere('individual.name ILIKE :search')
                        .orWhere('individual.lastName ILIKE :search')
                        .orWhere('"order".id::text ILIKE :search');
                }),
                { search: `%${search}%` }
            );
        }

        const [transactions, total] = await qb.getManyAndCount();

        return {
            data: instanceToPlain(transactions),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
