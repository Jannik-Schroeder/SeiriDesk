import { IsNotEmpty, IsString } from 'class-validator';

export class ListDocumentsDto {
  @IsString()
  @IsNotEmpty()
  sectionId!: string;
}
