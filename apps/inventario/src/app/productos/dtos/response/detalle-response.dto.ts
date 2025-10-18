export class ProductoDetalleResponseDto {
  id!: number;
  sku!: string;
  nombre!: string;
  descripcion?: string;
  tipo!: string;

  // 🔹 Detalle específico según tipo
  detalleEspecifico?: Record<string, any>;

  // 🔹 Ubicación (bodega)
  ubicacion?: {
    idBodega: number;
    nombreBodega: string;
    cantidadDisponible: number;
  };

  // 🔹 Regulaciones o normativas
  regulaciones?: {
    pais: string;
    normativaTributaria: string;
    observaciones?: string;
  };
}
