import { VisitaCliente, EstadoVisita } from '../../entities/visita-cliente.entity';

export interface IVisitaRepository {
  create(visita: VisitaCliente): Promise<VisitaCliente>;
  findByCliente(clienteId: string): Promise<VisitaCliente[]>;
  updateEstado(id: string, estado: EstadoVisita): Promise<void>;
  addComentario(id: string, comentarios: string): Promise<void>;
  findById(id: string): Promise<VisitaCliente | null>;
  updateEvidenciaVideo(id: string, urlVideo: string): Promise<void>;
}
