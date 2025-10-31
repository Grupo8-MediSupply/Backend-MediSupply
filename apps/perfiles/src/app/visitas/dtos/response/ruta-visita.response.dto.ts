import { Expose } from 'class-transformer';
import { EstadoVisita } from '@medi-supply/perfiles-dm';
import type { Ubicacion } from '@medi-supply/core';

interface RutaVisitaResponseProps {
  visitaId: string;
  clienteId: string;
  nombreCliente: string;
  fechaVisita: Date;
  estado: EstadoVisita;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export class RutaVisitaResponseDto {
  @Expose()
  visitaId: string;

  @Expose()
  clienteId: string;

  @Expose()
  nombreCliente: string;

  @Expose()
  fechaVisita: string;

  @Expose()
  estado: EstadoVisita;

  @Expose()
  direccion: string | null;

  @Expose()
  ubicacion: Ubicacion | null;

  constructor(props: RutaVisitaResponseProps) {
    this.visitaId = props.visitaId;
    this.clienteId = props.clienteId;
    this.nombreCliente = props.nombreCliente;
    this.fechaVisita = props.fechaVisita.toISOString();
    this.estado = props.estado;

    const lat =
      props.latitud !== undefined && props.latitud !== null
        ? Number(props.latitud)
        : null;
    const lng =
      props.longitud !== undefined && props.longitud !== null
        ? Number(props.longitud)
        : null;

    this.ubicacion =
      lat !== null && lng !== null
        ? {
            lat,
            lng,
          }
        : null;

    if (props.direccion) {
      this.direccion = props.direccion;
    } else if (this.ubicacion) {
      this.direccion = `Lat: ${this.ubicacion.lat}, Lng: ${this.ubicacion.lng}`;
    } else {
      this.direccion = null;
    }
  }
}
