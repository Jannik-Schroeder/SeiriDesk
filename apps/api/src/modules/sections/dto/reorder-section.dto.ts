import { IsInt, Min } from 'class-validator';

export class ReorderSectionDto {
  @IsInt()
  @Min(0)
  targetPosition!: number;
}
