import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export class SearchQueryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @IsNotEmpty()
  householdId!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @IsNotEmpty()
  q!: string;

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
}
