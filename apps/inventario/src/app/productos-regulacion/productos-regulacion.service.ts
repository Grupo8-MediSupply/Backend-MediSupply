import { Injectable, Inject } from '@nestjs/common';
import type { IProductoRegulacionRepository, ProductoRegulacion } from '@medi-supply/productos-dm';
import { DetalleRegulacion, ProductoRegulacionResponseDto } from './dtos/response/producto-regulacion.response.dto';

@Injectable()
export class ProductosRegulacionService {
  constructor(
    @Inject('IProductoRegulacionRepository')
    private readonly repo: IProductoRegulacionRepository,
  ) {}

  async asociarRegulaciones(productoId: string, regulacionIds: string[]): Promise<ProductoRegulacionResponseDto[]> {
    const asociadas: ProductoRegulacion[] = await this.repo.asociarRegulaciones(productoId, regulacionIds);
    return asociadas.map((r) => ({
      id: r.id!,
      productoId: r.productoId,
      regulacionId: r.regulacionId,
      fechaAsociacion: r.fechaAsociacion!,
      cumplimiento: true,
    }));
  }

  async listarPorProducto(productoId: string): Promise<DetalleRegulacion[]> {
    const asociadas: ProductoRegulacion[] = await this.repo.listarRegulacionesPorProducto(productoId);
    return asociadas.map((r) => ({
      regulacionId: r.regulacionId,
      fechaAsociacion: r.fechaAsociacion!,
      cumplimiento: r.cumplimiento ?? false,
      nombre: r.nombre!,
      descripcion: r.descripcion!,
      tipoNorma: r.tipo_norma!,
      paisId: r.pais_id!,
    }));
  }
}
