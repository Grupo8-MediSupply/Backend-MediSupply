import { ProductoRegulacion, RegulacionDetalle } from '../../entities/producto-regulacion.entity';

export interface IProductoRegulacionRepository {
  asociarRegulaciones(productoId: string, regulacionIds: string[]): Promise<ProductoRegulacion[]>;
  listarRegulacionesPorProducto(productoId: string): Promise<RegulacionDetalle[]>;
}
