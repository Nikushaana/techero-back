import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class LocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    building_number: string;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @ValidateNested()
    @Type(() => LocationDto)
    @IsNotEmpty()
    location: LocationDto;
}
