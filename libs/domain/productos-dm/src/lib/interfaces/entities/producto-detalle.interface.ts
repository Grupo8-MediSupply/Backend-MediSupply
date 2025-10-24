export class ProductoDetalle {
  id!: number;
  sku!: string;
  nombre!: string;
  descripcion?: string;
  tipo!: string;
  precio!: number;
  proveedor!: ProveedorDetailDto;
  productoPaisId!: number;
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