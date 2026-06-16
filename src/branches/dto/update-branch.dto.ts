import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsNotEmpty, ValidateNested, Min } from 'class-validator';

class LocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class UpdateBranchDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    building_number: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsOptional()
    @Min(0.01)
    coverage_radius_km: number;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    fix_off_site_price: number;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    installation_price: number;
    
    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    fix_on_site_price: number;

    @ValidateNested()
    @Type(() => LocationDto)
    @IsOptional()
    location: LocationDto;
}
