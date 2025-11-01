import { Ubicacion } from '@medi-supply/core';
import { OrdenEntrega } from 'src/lib/entities/orden.entity';
import { Vehiculo } from 'src/lib/entities/vehiculo.entity';

export interface RepartoOrden {
  orden: OrdenEntrega;
  vehiculoAsignado: Vehiculo;
}

export interface RutaVehiculo {
  vehiculoId: string;
  placa: string;
  modelo: string;
  origen: Ubicacion;
  bodegas: Ubicacion[];
  clientes: Ubicacion[];
  ordenesIds: string[];
}

export interface RutaGenerada {
  vehiculoId: string;
  ordenesIds: string[];
  distancia: number;
  duracion: number;
  polilinea: string;
  legs: any[];
}
