import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class HistorialComprasQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'El proveedorId debe ser un UUID válido' })
  proveedorId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fechaInicio debe estar en formato ISO 8601' })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fechaFin debe estar en formato ISO 8601' })
  fechaFin?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El país debe ser un número' })
  pais?: number;
}
