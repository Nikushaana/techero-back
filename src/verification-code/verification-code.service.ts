import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Repository } from 'typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import { PhoneDto, VerifyCodeDto } from './dto/verification-code.dto';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Admin } from 'src/admin/entities/admin.entity';

@Injectable()
export class VerificationCodeService {
    constructor(
        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,
        
        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,
        
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        @InjectRepository(VerificationCode)
        private VerificationCodeRepo: Repository<VerificationCode>,
    ) { }

    async sendCode(phoneDto: PhoneDto, type: 'register' | 'reset-password' | 'change-number') {
        const exists =
            (await this.individualClientRepo.findOne({ where: { phone: phoneDto.phone } })) ||
            (await this.companyClientRepo.findOne({ where: { phone: phoneDto.phone } })) ||
            (await this.deliveryRepo.findOne({ where: { phone: phoneDto.phone } })) ||
            (await this.technicianRepo.findOne({ where: { phone: phoneDto.phone } })) ||
            (await this.adminRepo.findOne({ where: { phone: phoneDto.phone } }))
            ;
        if (type === 'register' || type === 'change-number') {
            if (exists) throw new BadRequestException('Phone already used');
        } else if (type === 'reset-password') {
            if (!exists) throw new NotFoundException(`User not found`);
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await this.VerificationCodeRepo.upsert(
            { phone: phoneDto.phone, code, expires_at, type },
            ['phone', 'type'], // phone + type unique
        );

        return { message: `Code ${code} sent to ${phoneDto.phone}`, code: code };
    }

    async verifyCode(verifyCodeDto: VerifyCodeDto, type: 'register' | 'reset-password' | 'change-number') {
        const entry = await this.VerificationCodeRepo.findOne({
            where: { phone: verifyCodeDto.phone, type },
        });
        if (!entry) throw new BadRequestException('No code sent');

        if (new Date() > entry.expires_at) {
            await this.VerificationCodeRepo.delete({ phone: verifyCodeDto.phone, type });
            throw new BadRequestException('Code expired');
        }

        if (entry.code !== verifyCodeDto.code) {
            throw new BadRequestException('Invalid code');
        }

        await this.VerificationCodeRepo.update({ phone: verifyCodeDto.phone, type }, { verified: true });

        return { message: 'Code verified' };
    }
}