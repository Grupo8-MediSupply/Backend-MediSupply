import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AuditoriaFiltroDto {
  @IsOptional()
  @IsString()
  usuario?: string; // email o userId

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
