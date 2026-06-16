import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTechnicianDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsString()
    imagesToDelete: string;
}
