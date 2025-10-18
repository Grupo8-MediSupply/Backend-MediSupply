import { Exclude, Expose } from 'class-transformer';
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { EstadoVisita } from '@medi-supply/perfiles-dm';

@Exclude() // 👈 solo se exponen los campos marcados con @Expose
export class VisitaResponseDto {
  @Expose()
  @IsUUID()
  id!: string;

  @Expose()
  @IsUUID()
  clienteId!: string;

  @Expose()
  @IsUUID()
  vendedorId!: string;

  @Expose()
  @IsDateString()
  fechaVisita!: Date;

  @Expose()
  @IsString()
  estado!: EstadoVisita;

  @Expose()
  @IsOptional()
  @IsString()
  comentarios?: string | null;

  @Expose()
  @IsDateString()
  createdAt!: Date;

  @Expose()
  @IsDateString()
  updatedAt!: Date;

  constructor(
    id: string,
    clienteId: string,
    vendedorId: string,
    fechaVisita: Date,
    estado: EstadoVisita,
    comentarios: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.clienteId = clienteId;
    this.vendedorId = vendedorId;
    this.fechaVisita = fechaVisita;
    this.estado = estado;
    this.comentarios = comentarios;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
