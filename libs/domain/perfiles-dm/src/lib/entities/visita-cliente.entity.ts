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

export class VisitaClienteRecomendacion extends VisitaCliente {
  public recomendaciones: string; // Recomendaciones específicas para la visita
  public url_video?: string | null; // URL del video asociado a la visita
  
  constructor(props: {
    id?: string,
    clienteId: string,
    vendedorId: string,
    fechaVisita: Date,
    estado?: EstadoVisita,
    comentarios?: string | null,
    recomendaciones: string,
    url_video?: string | null,
  }) {
    super({
      id: props.id,
      clienteId: props.clienteId,
      vendedorId: props.vendedorId,
      fechaVisita: props.fechaVisita,
      estado: props.estado,
      comentarios: props.comentarios,
    });
    this.recomendaciones = props.recomendaciones;
    this.url_video = props.url_video ?? null;
  }
}


