import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalFilename!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(127)
  mimeType!: string;

  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  storageKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string | null;
}
