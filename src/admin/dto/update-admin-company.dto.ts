import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateAdminCompanyDto {
    @IsOptional()
    @Matches(/^5[0-9]{8}$/, {
        message: 'Phone number must start with 5 and be 9 digits long',
    })
    phone: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    companyAgentName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    companyAgentLastName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    companyIdentificationCode: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsNotEmpty()
    status: boolean;

    @IsOptional()
    @IsString()
    imagesToDelete: string;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}