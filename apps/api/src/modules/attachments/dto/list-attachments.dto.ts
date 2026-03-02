import { IsNotEmpty, IsString } from 'class-validator';

export class ListAttachmentsDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;
}
