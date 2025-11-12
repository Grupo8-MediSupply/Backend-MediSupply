import { ApiProperty } from '@nestjs/swagger';
import type { ProductoOrden } from '@medi-supply/ordenes-dm';

class ProductoHistorialDto {
  @ApiProperty({ example: 'lote-123' })
  lote!: string;

  @ApiProperty({ example: 5 })
  cantidad!: number;

  @ApiProperty({ example: 'bodega-789' })
  bodega!: string;

  @ApiProperty({ example: 120.5, required: false, nullable: true })
  precioUnitario?: number;

  @ApiProperty({ example: 'producto-456', required: false, nullable: true })
  productoRegional?: string;

  constructor(producto: ProductoOrden) {
    this.lote = producto.lote;
    this.cantidad = producto.cantidad;
    this.bodega = producto.bodega;
    this.precioUnitario = producto.precioUnitario;
    this.productoRegional = producto.productoRegional;
  }
}

export class HistorialOrdenResponseDto {
  @ApiProperty({ example: 'orden-123' })
  ordenId!: string;

  @ApiProperty({ example: 'COMPLETADO' })
  estado!: string;

  @ApiProperty({ example: 1450.75 })
  total!: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  fechaCreacion!: string;

  @ApiProperty({ example: '2024-01-16T08:15:00.000Z' })
  fechaActualizacion!: string;

  @ApiProperty({ type: () => ProductoHistorialDto, isArray: true })
  productos!: ProductoHistorialDto[];

  constructor(props: {
    ordenId: string;
    estado: string;
    total: number;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    productos: ProductoOrden[];
  }) {
    this.ordenId = props.ordenId;
    this.estado = props.estado;
    this.total = props.total;
    this.fechaCreacion = props.fechaCreacion.toISOString();
    this.fechaActualizacion = props.fechaActualizacion.toISOString();
    this.productos = props.productos.map(
      (producto) => new ProductoHistorialDto(producto)
    );
  }
}
