import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  householdId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
