import { VisitaCliente, EstadoVisita } from '../../entities/visita-cliente.entity';

export type RutaVisitaProgramada = {
  visitaId: string;
  clienteId: string;
  fechaVisita: Date;
  estado: EstadoVisita;
  nombreCliente: string;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

export interface IVisitaRepository {
  create(visita: VisitaCliente): Promise<VisitaCliente>;
  findByCliente(clienteId: string): Promise<VisitaCliente[]>;
  updateEstado(id: string, estado: EstadoVisita): Promise<void>;
  addComentario(id: string, comentarios: string): Promise<void>;
  findById(id: string): Promise<VisitaCliente | null>;
  updateEvidenciaVideo(id: string, urlVideo: string): Promise<void>;
  findRutaPorFecha(
    vendedorId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<RutaVisitaProgramada[]>;
}
