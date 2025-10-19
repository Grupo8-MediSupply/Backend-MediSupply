import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class ProductoRegulacionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  regulacionIds!: string[];
}
