import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetStreetsDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    street: string;
}