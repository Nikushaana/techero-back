import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateReviewDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    review?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    stars?: number;

    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
