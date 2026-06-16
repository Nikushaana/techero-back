import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFaqDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    question: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    answer: string;

    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    order: number;
}
