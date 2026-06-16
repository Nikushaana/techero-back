import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class LocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class CreateBranchDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    building_number: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0.01)
    coverage_radius_km: number;

    @IsNumber()
    @IsNotEmpty()
    fix_off_site_price: number;

    @IsNumber()
    @IsNotEmpty()
    installation_price: number;
    
    @IsNumber()
    @IsNotEmpty()
    fix_on_site_price: number;

    @ValidateNested()
    @Type(() => LocationDto)
    @IsNotEmpty()
    location: LocationDto;
}
