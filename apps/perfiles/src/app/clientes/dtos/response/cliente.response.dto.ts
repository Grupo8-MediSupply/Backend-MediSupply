import { Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class ClienteResponseDto {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  @Length(2, 150)
  nombre!: string;

  @Expose()
  @IsString()
  tipoInstitucion!: string;

  @Expose()
  @IsString()
  clasificacion!: string;

  @Expose()
  @IsString()
  responsableContacto!: string;

  constructor(
    id: string,
    nombre: string,
    tipoInstitucion: string,
    clasificacion: string,
    responsableContacto: string,
  ) {
    this.id = id;
    this.nombre = nombre;
    this.tipoInstitucion = tipoInstitucion;
    this.clasificacion = clasificacion;
    this.responsableContacto = responsableContacto;
  }
}
