import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoOrden } from '@medi-supply/ordenes-dm';

export class ObtenerPedidosQueryDto {
  @IsOptional()
  @Transform(({ value }) => value?.toString().toUpperCase()) 
  @IsEnum(EstadoOrden, { message: 'Estado inválido' })
  state?: EstadoOrden;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
