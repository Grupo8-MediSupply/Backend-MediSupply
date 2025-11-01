import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReporteVendedorQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'vendedorId debe ser un UUID válido' })
  vendedorId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'planId debe ser un UUID válido' })
  planId?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'productoId debe ser un UUID válido' })
  productoId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaInicio debe estar en formato ISO-8601' })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaFin debe estar en formato ISO-8601' })
  fechaFin?: string;
}
