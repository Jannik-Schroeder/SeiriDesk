import { IsNotEmpty, IsString } from 'class-validator';

export class ListSectionsDto {
  @IsString()
  @IsNotEmpty()
  folderId!: string;
}
