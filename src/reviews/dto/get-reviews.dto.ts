import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class GetReviewsDto {
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
}
