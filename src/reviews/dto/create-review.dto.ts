import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    review: string;

    @IsInt()
    @Min(1)
    @Max(5)
    stars: number;
}
