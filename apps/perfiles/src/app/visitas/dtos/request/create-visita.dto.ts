import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateVisitaDto {
  @IsUUID()
  clienteId!: string;

  @IsUUID()
  vendedorId!: string;

  @IsDateString({}, { message: 'La fecha de visita debe ser una fecha válida (ISO 8601)' })
  fechaVisita!: string;

  @IsOptional()
  @IsString()
  comentarios?: string;
}
