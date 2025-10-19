import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class PaisResponseDto {
  @Expose()
  @IsNumber()
  id!: number;

  @Expose()
  @IsString()
  codigoIso!: string;

  @Expose()
  @IsString()
  nombre!: string;

  @Expose()
  @IsString()
  moneda!: string;

  @Expose()
  @IsString()
  simboloMoneda!: string;

  @Expose()
  @IsString()
  zonaHoraria!: string;

  @Expose()
  @IsString()
  idiomaOficial!: string;

  @Expose()
  @IsOptional()
  @IsString()
  reguladorSanitario?: string | null;

  constructor(
    id: number,
    codigoIso: string,
    nombre: string,
    moneda: string,
    simboloMoneda: string,
    zonaHoraria: string,
    idiomaOficial: string,
    reguladorSanitario?: string | null,
  ) {
    this.id = id;
    this.codigoIso = codigoIso;
    this.nombre = nombre;
    this.moneda = moneda;
    this.simboloMoneda = simboloMoneda;
    this.zonaHoraria = zonaHoraria;
    this.idiomaOficial = idiomaOficial;
    this.reguladorSanitario = reguladorSanitario ?? null;
  }
}
