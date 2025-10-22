import { BaseEntity } from '@medi-supply/core';

export enum EstadoVisita {
  PROGRAMADA = 'PROGRAMADA',
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
}

export class VisitaCliente extends BaseEntity<string> {

    public clienteId: string;          // UUID del cliente
    public vendedorId: string;          // UUID del vendedor
    public fechaVisita: Date;           // Fecha programada
    public estado: EstadoVisita = EstadoVisita.PROGRAMADA; // Estado por defecto
    public comentarios?: string | null; // Campo opcional

  constructor(props:{
    id?: string,
    clienteId: string,
    vendedorId: string,
    fechaVisita: Date,
    estado?: EstadoVisita,
    comentarios?: string | null,
  }) {
    super({
      id: props.id ?? crypto.randomUUID(),
    });
    this.clienteId = props.clienteId;
    this.vendedorId =  props.vendedorId;
    this.fechaVisita = props.fechaVisita;
    this.estado = props.estado ?? EstadoVisita.PROGRAMADA;
    this.comentarios = props.comentarios ?? null;
  }
}


