import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

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
    return parseStrictInteger(value, DEFAULT_LIMIT);
  })
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit = DEFAULT_LIMIT;
}
