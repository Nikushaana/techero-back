import { BadRequestException } from "@nestjs/common";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum UserStatus {
    ACTIVE = 'true',
    INACTIVE = 'false',
}

export class GetUsersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new BadRequestException('Invalid boolean');
    })
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsString()
    search?: string;
}