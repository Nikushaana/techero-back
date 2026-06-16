import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserOrderDto {
    @IsOptional()
    @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    model: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    imagesToDelete: string

    @IsOptional()
    @IsString()
    videosToDelete: string
}
