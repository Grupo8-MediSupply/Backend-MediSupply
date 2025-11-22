import { Ubicacion } from "@medi-supply/core";
import { BodegaOrigen, InformacionGeneralOrden, Orden, OrdenEntrega } from "src/lib/entities/orden.entity";
import { Vehiculo } from "src/lib/entities/vehiculo.entity";
import { RutaGenerada, RutaVehiculo } from "../vo/RepartoOrden.interface";
import { HistorialVenta } from "../vo/historial-venta.interfaces";

export interface IOrdenesRepository {
  crearOrden(orden: Orden): Promise<Orden>;
  actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden>;
  buscarOrdenes(filtros: any): Promise<Orden[]>;
  obtenerOrdenesParaEntregar(filtros: FiltrosEntrega): Promise<OrdenEntrega[]>;
  obtenerVehiculoMasCercano(bodegas:Ubicacion[]): Promise<Vehiculo | null>;
  guardarRutaDeReparto(vehiculoId:string, ruta:RutaGenerada): Promise<string>;
  buscarOrdenPorId(ordenId:string): Promise<Orden | null>;
  buscarRutaPorOrdenId(ordenId:string): Promise<RutaGenerada | null>;
  obtenerHistorialVentasPorCliente(
    vendedorId: string,
    clienteId: string
  ): Promise<HistorialVenta[]>;
  obtenerOrdenesPorCliente(clienteId: string,filtros:any): Promise<InformacionGeneralOrden[]>;
}

export interface FiltrosEntrega {
  fechaInicio?: string;
  fechaFin?: string;
  paisId: number;
}