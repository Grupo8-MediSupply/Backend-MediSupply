import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class ProductoOrdenDto {
  @IsUUID()
  @IsNotEmpty()
  lote!: string;

  @IsInt()
  @Min(1, { message: 'cantidad debe ser mayor o igual a 1' })
  cantidad!: number;

  @IsUUID()
  @IsNotEmpty()
  bodega!: string;

}

export class CrearOrdenClienteDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductoOrdenDto)
  productos!: ProductoOrdenDto[];

  @IsOptional()
  @IsUUID()
  vendedor?: string;
}

export class OrdenCreadaDto {
  @IsUUID()
  id!: string;
  estado?: string;
}