import { ProductoRegulacion } from '../../entities/producto-regulacion.entity';

export interface IProductoRegulacionRepository {
  asociarRegulaciones(productoId: number, regulacionIds: string[]): Promise<ProductoRegulacion[]>;
  listarRegulacionesPorProducto(productoId: number): Promise<ProductoRegulacion[]>;
}
