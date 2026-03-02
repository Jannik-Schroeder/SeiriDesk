import { Transform } from 'class-transformer';
import { IsISO8601, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export class ReviewDueQueryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @IsNotEmpty()
  householdId!: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return String(value).trim();
  })
  @IsOptional()
  @IsISO8601()
  asOf?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return DEFAULT_LIMIT;
    }

    return Number.parseInt(String(value), 10);
  })
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit = DEFAULT_LIMIT;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 0;
    }

    return Number.parseInt(String(value), 10);
  })
  @IsInt()
  @Min(0)
  offset = 0;
}
