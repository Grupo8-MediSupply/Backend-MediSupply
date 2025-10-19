import { Expose } from 'class-transformer';
import { IsString, IsNumber, IsDate } from 'class-validator';

export class BodegaResponseDto {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsNumber()
  paisId!: number;

  @Expose()
  @IsString()
  nombre!: string;

  @Expose()
  @IsString()
  ubicacion!: string;

  @Expose()
  @IsNumber()
  capacidad!: number;

  @Expose()
  @IsString()
  responsable!: string;

  @Expose()
  @IsDate()
  createdAt!: Date;

  @Expose()
  @IsDate()
  updatedAt!: Date;

  constructor(
    id: string,
    paisId: number,
    nombre: string,
    ubicacion: string,
    capacidad: number,
    responsable: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.paisId = paisId;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
    this.capacidad = capacidad;
    this.responsable = responsable;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
