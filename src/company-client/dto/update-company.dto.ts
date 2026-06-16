import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
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
    @IsString()
    imagesToDelete: string;
}
