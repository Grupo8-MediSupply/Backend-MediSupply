import { Proveedor } from 'src/lib/entities/proveedor.entity';
import { HistorialCompra } from '../vo/historial-compra.interface';
import { HistorialCompraFiltros } from '../vo/historial-compra-filtros.interface';

export interface IProveedorRepository {
  create(proveedor: Proveedor): Promise<Proveedor>;
  findById(id: string): Promise<Proveedor | null>;
  findByPais(paisId: number): Promise<Proveedor[]>;
  obtenerHistorialCompras(filtros: HistorialCompraFiltros): Promise<HistorialCompra[]>;
}
