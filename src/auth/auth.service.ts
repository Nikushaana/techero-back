import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { AdminToken } from 'src/admin-token/entities/admin-token.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { IndividualClientToken } from 'src/individual-client-token/entities/individual-client-token.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { CompanyClientToken } from 'src/company-client-token/entities/company-client-token.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { TechnicianToken } from 'src/technician-token/entities/technician-token.entity';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { PhoneDto, ResetPasswordDto, VerifyCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { DeliveryToken } from 'src/delivery-token/entities/delivery-token.entity';
import { RegisterIndAdmTechDelDto } from './dto/register-ind-adm-tech-del.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        @InjectRepository(AdminToken)
        private adminTokenRepo: Repository<AdminToken>,

        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        @InjectRepository(IndividualClientToken)
        private individualClientTokenRepo: Repository<IndividualClientToken>,

        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        @InjectRepository(CompanyClientToken)
        private companyClientTokenRepo: Repository<CompanyClientToken>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(TechnicianToken)
        private technicianTokenRepo: Repository<TechnicianToken>,

        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

        @InjectRepository(DeliveryToken)
        private deliveryTokenRepo: Repository<DeliveryToken>,

        @InjectRepository(VerificationCode)
        private VerificationCodeRepo: Repository<VerificationCode>,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly notificationService: NotificationsService,

        private readonly jwtService: JwtService,

        private readonly configService: ConfigService,
    ) { }

    private getCookieOptions() {
        return {
            secure: true,
            httpOnly: true,
            sameSite: 'lax' as const,
            domain: '.techero.ge',
            path: '/',
        };
    }

    // send and verify sent code
    async sendRegisterCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'register');
    }

    async verifyRegisterCode(verifyCodeDto: VerifyCodeDto) {
        return this.verificationCodeService.verifyCode(verifyCodeDto, 'register');
    }

    // users
    async register(dto: RegisterCompanyDto | RegisterIndAdmTechDelDto, role: 'individual' | 'company' | 'technician' | 'delivery' | 'admin') {
        const codeEntry = await this.VerificationCodeRepo.findOne({
            where: { phone: dto.phone, verified: true, type: 'register' },
        });
        if (!codeEntry) throw new BadRequestException('Phone not verified');

        const exists =
            (await this.individualClientRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.companyClientRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.technicianRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.deliveryRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.adminRepo.findOne({ where: { phone: dto.phone } }))
            ;

        if (exists) throw new BadRequestException('User already registered');

        const { password, ...rest } = dto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const repo: any =
            role === 'individual'
                ? this.individualClientRepo
                : role === 'admin'
                    ? this.adminRepo
                    : role === 'technician'
                        ? this.technicianRepo
                        : role === 'delivery'
                            ? this.deliveryRepo
                            : role === 'company'
                                ? this.companyClientRepo
                                : null;

        if (!repo) {
            throw new BadRequestException('Invalid role');
        }

        const user = repo.create({
            ...rest,
            password: hashedPassword,
        });

        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: dto.phone, type: 'register' });


        // send notification to admin
        const roleInGeo =
            role === 'individual'
                ? "ფიზიკური პირი"
                : role === 'admin'
                    ? "ადმინი"
                    : role === 'technician'
                        ? "ტექნიკოსი"
                        : role === 'delivery'
                            ? "კურიერი"
                            : role === 'company'
                                ? "იურიდიული პირი"
                                : "მომხმარებელი";

        await this.notificationService.sendNotification(
            `დარეგისტრირდა ${roleInGeo + ` №${user.id} ` + (user.companyName || (user.name + " " + user.lastName))}`,
            NotificationType.NEW_USER,
            'admin',
            undefined,
            {
                user_id: user.id,
                user_role: role,
            },
        );

        // send notification to user
        await this.notificationService.sendNotification(
            `გამარჯობა ${user.companyName || (user.name + " " + user.lastName)}, თქვენ წარმატებით დარეგისტრირდით.`,
            NotificationType.NEW_USER,
            user.role,
            user.id,
        );

        return {
            message: `${role} registered successfully`,
            user: instanceToPlain(user),
        };
    }

    async login(loginUserDto: LoginUserDto, res: Response) {
        const { phone, password } = loginUserDto;

        // ===== USER REPOSITORIES =====
        const userRepoMap = {
            individual: this.individualClientRepo,
            company: this.companyClientRepo,
            technician: this.technicianRepo,
            delivery: this.deliveryRepo,
            admin: this.adminRepo,
        };

        const tokenRepoMap: Record<string, any> = {
            individual: this.individualClientTokenRepo,
            company: this.companyClientTokenRepo,
            technician: this.technicianTokenRepo,
            delivery: this.deliveryTokenRepo,
            admin: this.adminTokenRepo,
        };

        let user: any = null;
        let actualRole: keyof typeof userRepoMap | null = null;

        // ===== 1. FIND USER IN ALL TABLES =====
        for (const role of Object.keys(userRepoMap)) {
            const foundUser = await userRepoMap[role].findOne({
                where: { phone },
            });

            if (foundUser) {
                user = foundUser;
                actualRole = role as any;
                break;
            }
        }

        if (!user || !actualRole)
            throw new UnauthorizedException('Invalid credentials');

        // ===== 2. CHECK PASSWORD =====
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new UnauthorizedException('Invalid credentials');

        // ===== 3. CREATE TOKENS =====
        const payload = {
            id: user.id,
            role: actualRole,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_ACCESS') || '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_REFRESH') || '7d',
        });

        // ===== 4. SAVE REFRESH TOKEN =====
        const tokenRepo = tokenRepoMap[actualRole];
        const relationKey =
            ['technician', 'admin', 'delivery'].includes(actualRole)
                ? actualRole
                : `${actualRole}Client`;

        let tokenEntity = await tokenRepo.findOne({
            where: { [relationKey]: { id: user.id } },
        });

        if (tokenEntity) {
            tokenEntity.token = refreshToken;
        } else {
            tokenEntity = tokenRepo.create({
                [relationKey]: user,
                token: refreshToken,
            });
        }

        await tokenRepo.save(tokenEntity);

        // ===== 5. SET COOKIES =====
        res.cookie('accessToken', accessToken, {
            ...this.getCookieOptions(),
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            ...this.getCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            message: 'Logged in successfully asdasd',
            user: instanceToPlain(user),
        };
    }

    async refreshAccessToken(refreshToken: string, res: Response) {
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        let payload: any;

        try {
            payload = this.jwtService.verify(refreshToken);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokenRepoMap = {
            admin: this.adminTokenRepo,
            technician: this.technicianTokenRepo,
            delivery: this.deliveryTokenRepo,
            individual: this.individualClientTokenRepo,
            company: this.companyClientTokenRepo,
        };

        const tokenRepo = tokenRepoMap[payload.role];

        if (!tokenRepo) {
            throw new UnauthorizedException('Invalid role');
        }

        // Check token exists in DB
        const tokenEntry = await tokenRepo.findOne({
            where: { token: refreshToken },
        });

        if (!tokenEntry) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const newAccessToken = this.jwtService.sign(
            { id: payload.id, role: payload.role },
            { expiresIn: this.configService.get<string>('JWT_EXPIRES_ACCESS') || '15m' },
        );

        res.cookie('accessToken', newAccessToken, {
            ...this.getCookieOptions(),
            maxAge: 15 * 60 * 1000,
        });

        return { message: 'Access token refreshed' };
    }

    async getMe(user: { id: number; role: string }) {
        const repoMap = {
            admin: this.adminRepo,
            company: this.companyClientRepo,
            individual: this.individualClientRepo,
            technician: this.technicianRepo,
            delivery: this.deliveryRepo,
        };

        const repo = repoMap[user.role];
        if (!repo) throw new UnauthorizedException('Unknown role');

        const findUser = await repo.findOne({ where: { id: user.id } });
        if (!findUser) throw new UnauthorizedException('User not found');

        return instanceToPlain(findUser);
    }

    async logout(refreshToken: string, res: Response) {
        if (!refreshToken) {
            res.clearCookie("accessToken", this.getCookieOptions());

            res.clearCookie("refreshToken", this.getCookieOptions());
            return { message: 'Logged out' };
        }

        let payload: any;

        try {
            payload = this.jwtService.verify(refreshToken);
        } catch {
            res.clearCookie("accessToken", this.getCookieOptions());

            res.clearCookie("refreshToken", this.getCookieOptions());
            return { message: 'Logged out' };
        }

        const tokenRepoMap = {
            admin: this.adminTokenRepo,
            technician: this.technicianTokenRepo,
            delivery: this.deliveryTokenRepo,
            individual: this.individualClientTokenRepo,
            company: this.companyClientTokenRepo,
        };

        const tokenRepo = tokenRepoMap[payload.role];

        if (tokenRepo) {
            await tokenRepo.delete({ token: refreshToken });
        }

        res.clearCookie("accessToken", this.getCookieOptions());

        res.clearCookie("refreshToken", this.getCookieOptions());

        return { message: 'Logged out successfully' };
    }

    async sendResetPasswordCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'reset-password');
    }

    async resetPassword(
        resetPasswordDto: ResetPasswordDto
    ) {
        await this.verificationCodeService.verifyCode(
            { phone: resetPasswordDto.phone, code: resetPasswordDto.code },
            'reset-password',
        );

        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

        const individual = await this.individualClientRepo.findOne({ where: { phone: resetPasswordDto.phone } });
        const company = await this.companyClientRepo.findOne({ where: { phone: resetPasswordDto.phone } });
        const technician = await this.technicianRepo.findOne({ where: { phone: resetPasswordDto.phone } });
        const delivery = await this.deliveryRepo.findOne({ where: { phone: resetPasswordDto.phone } });

        let user;
        let repo;
        let role: 'individual' | 'company' | 'technician' | 'delivery';

        if (individual) {
            user = individual;
            repo = this.individualClientRepo;
            role = 'individual';
        } else if (company) {
            user = company;
            repo = this.companyClientRepo;
            role = 'company';
        } else if (technician) {
            user = technician;
            repo = this.technicianRepo;
            role = 'technician';
        } else if (delivery) {
            user = delivery;
            repo = this.deliveryRepo;
            role = 'delivery';
        } else {
            throw new BadRequestException('User not found');
        }

        user.password = hashedPassword;
        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: resetPasswordDto.phone, type: 'reset-password' });

        return {
            message: `${role} password reset successfully`,
            user: instanceToPlain(user),
        };
    }
}
