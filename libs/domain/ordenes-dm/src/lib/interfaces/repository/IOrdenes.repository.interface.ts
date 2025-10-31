import { Orden, OrdenEntrega } from "src/lib/entities/orden.entity";

export interface IOrdenesRepository {
  crearOrden(orden: Orden): Promise<Orden>;
  actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden>;
  buscarOrdenes(filtros: any): Promise<Orden[]>;
  obtenerOrdenesParaEntregar(filtros: FiltrosEntrega): Promise<OrdenEntrega[]>;
}

export interface FiltrosEntrega {
  fechaInicio?: string;
  fechaFin?: string;
  paisId: number;
}