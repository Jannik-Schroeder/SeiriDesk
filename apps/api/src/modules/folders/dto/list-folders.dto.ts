import { IsNotEmpty, IsString } from 'class-validator';

export class ListFoldersDto {
  @IsString()
  @IsNotEmpty()
  householdId!: string;
}
