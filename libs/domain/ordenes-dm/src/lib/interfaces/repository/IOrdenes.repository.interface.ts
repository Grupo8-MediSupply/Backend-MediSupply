import { Ubicacion } from "@medi-supply/core";
import { BodegaOrigen, Orden, OrdenEntrega } from "src/lib/entities/orden.entity";
import { Vehiculo } from "src/lib/entities/vehiculo.entity";

export interface IOrdenesRepository {
  crearOrden(orden: Orden): Promise<Orden>;
  actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden>;
  buscarOrdenes(filtros: any): Promise<Orden[]>;
  obtenerOrdenesParaEntregar(filtros: FiltrosEntrega): Promise<OrdenEntrega[]>;
  obtenerVehiculoMasCercano(bodegas:Ubicacion[]): Promise<Vehiculo | null>;
}

export interface FiltrosEntrega {
  fechaInicio?: string;
  fechaFin?: string;
  paisId: number;
}