import { ProductoOrden } from '../../entities/orden.entity';
import { EstadoOrden } from '../../enum/orden-estado';

export interface HistorialVenta {
  ordenId: string;
  clienteId: string;
  vendedorId?: string;
  estado: EstadoOrden;
  total: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  productos: ProductoOrden[];
}
