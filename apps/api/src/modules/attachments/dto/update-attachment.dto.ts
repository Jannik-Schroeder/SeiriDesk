import { AttachmentOcrStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  documentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFilename?: string;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sizeBytes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  storageKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string | null;

  @IsOptional()
  @IsEnum(AttachmentOcrStatus)
  ocrStatus?: AttachmentOcrStatus;

  @IsOptional()
  @IsString()
  ocrText?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ocrError?: string | null;
}
