import { ProductoVariant } from "@medi-supply/productos-dm";

export class ProductoDetalle {
  producto_info!: ProductoVariant;
  tipo!: string;
  precio!: number;
  proveedor!: ProveedorDetailDto;
  productoPaisId!: number;
  bodegas!: BodegaConLotes[];
}

export interface ProveedorDetailDto{
  id: string;
  nombre: string;
  pais: string;
}

export interface ProductoBodega{
  BodegaId: string;
  nombreProducto: string;
  cantidad: number;
  FechaVencimiento?: Date;
  sku: string;
  productoRegionalId: string;
  numeroLote: string;
  loteId: string;
}

export interface LoteBodega {
  loteId: number;
  cantidad: number;
}

export interface BodegaConLotes {
  bodegaId: number;
  bodegaNombre: string;
  lotes: LoteBodega[];
}
