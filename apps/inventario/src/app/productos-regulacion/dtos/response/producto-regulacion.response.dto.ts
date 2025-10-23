export class ProductoRegulacionResponseDto {
  id!: string;
  productoId!: string;
  regulacionId!: string;
  fechaAsociacion!: Date;
  cumplimiento!: boolean;

}


export interface DetalleRegulacion{
  nombre: string;
  descripcion: string;
  tipoNorma: string;
  paisId: number;
  cumplimiento: boolean;
}
