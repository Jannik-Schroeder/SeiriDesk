import { Transform } from 'class-transformer';
import { IsISO8601, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseStrictInteger(value: unknown, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }

  const normalized = String(value).trim();
  if (normalized === '') {
    return fallback;
  }

  if (!/^-?\d+$/.test(normalized)) {
    return Number.NaN;
  }

  return Number.parseInt(normalized, 10);
}

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
    return parseStrictInteger(value, DEFAULT_LIMIT);
  })
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit = DEFAULT_LIMIT;

  @Transform(({ value }) => {
    return parseStrictInteger(value, 0);
  })
  @IsInt()
  @Min(0)
  offset = 0;
}
