import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PhoneDto, ResetPasswordDto, VerifyCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokenValidationGuard } from './guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterIndAdmTechDelDto } from './dto/register-ind-adm-tech-del.dto';
import type { Response, Request } from 'express';
import type { RequestInfo } from 'src/common/types/request-info';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // register
    @Post('send-register-code')
    async SendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @Post('verify-register-code')
    async VerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    // reset password
    @Post('send-reset-password-code')
    async SendResetPasswordCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendResetPasswordCode(phoneDto);
    }

    @Post('reset-password')
    async ResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.login(loginUserDto, res);
    }

    @Post('refresh-token')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'];
        return this.authService.refreshAccessToken(refreshToken, res);
    }

    @UseGuards(TokenValidationGuard)
    @Get('current-user')
    async getAdmin(@Req() req: RequestInfo) {
        return this.authService.getMe(req.user);
    }

    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'];
        return this.authService.logout(refreshToken, res);
    }
}

@Controller('auth/admin')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async AdminRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "admin");
    }
}

@Controller('auth/individual')
export class IndividualAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async IndividualRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "individual");
    }
}

@Controller('auth/company')
export class CompanyAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async CompanyRegister(
        @Body() registerCompanyDto: RegisterCompanyDto,
    ) {
        return this.authService.register(registerCompanyDto, "company");
    }
}

@Controller('auth/technician')
export class TechnicianAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('send-register-code')
    async TechnicianSendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('verify-register-code')
    async TechnicianVerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('register')
    async TechnicianRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "technician");
    }
}

@Controller('auth/delivery')
export class DeliveryAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('send-register-code')
    async DeliverySendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('verify-register-code')
    async DeliveryVerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('register')
    async DeliveryRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "delivery");
    }
}
