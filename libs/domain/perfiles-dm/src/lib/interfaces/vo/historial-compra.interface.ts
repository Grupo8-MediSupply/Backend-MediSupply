export interface HistorialCompra {
  proveedorId: string;
  producto: string;
  cantidad: number;
  valorTotal: number;
  fechaCompra: Date;
  paisId?: number;
}
