import { Ubicacion } from "@medi-supply/core";
import { BodegaOrigen, Orden, OrdenEntrega } from "src/lib/entities/orden.entity";
import { Vehiculo } from "src/lib/entities/vehiculo.entity";
import { RutaVehiculo } from "../vo/RepartoOrden.interface";

export interface IOrdenesRepository {
  crearOrden(orden: Orden): Promise<Orden>;
  actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden>;
  buscarOrdenes(filtros: any): Promise<Orden[]>;
  obtenerOrdenesParaEntregar(filtros: FiltrosEntrega): Promise<OrdenEntrega[]>;
  obtenerVehiculoMasCercano(bodegas:Ubicacion[]): Promise<Vehiculo | null>;
  guardarRutaDeReparto(vehiculoId:string, ordenId:string, ruta:RutaVehiculo): Promise<void>;
}

export interface FiltrosEntrega {
  fechaInicio?: string;
  fechaFin?: string;
  paisId: number;
}