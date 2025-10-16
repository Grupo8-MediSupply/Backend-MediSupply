import { IsString, IsOptional, IsEnum, IsNotEmpty, ValidateNested, IsDateString, IsNumber, Min, ValidateIf, Validate } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum TipoProducto {
  MEDICAMENTO = 'medicamento',
  INSUMO_MEDICO = 'insumo_medico',
  EQUIPO_MEDICO = 'equipo_medico'
}

export class CreateProductoBaseDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CreateProductoMedicamentoDto {
  @IsString()
  @IsOptional()
  principioActivo?: string;

  @IsString()
  @IsOptional()
  concentracion?: string;

  @IsString()
  @IsOptional()
  formaFarmaceutica?: string;

}

export class CreateProductoInsumoMedicoDto {
  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value).toISOString() : undefined)
  fechaVencimiento?: string;
}

export class CreateProductoEquipoMedicoDto {
  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @IsString()
  @IsOptional()
  proveedor?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value).toISOString() : undefined)
  fechaCompra?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  garantiaMeses?: number;
}

export class CreateProductoDto extends CreateProductoBaseDto {
  @IsEnum(TipoProducto, {
    message: 'El tipo debe ser uno de los siguientes: medicamento, insumo_medico, equipo_medico'
  })
  @IsNotEmpty()
  tipo!: TipoProducto;

  @ValidateNested()
  @Type(() => CreateProductoMedicamentoDto)
  @ValidateIf((o) => o.tipo === TipoProducto.MEDICAMENTO)
  @IsNotEmpty({ message: 'Los datos del medicamento son requeridos cuando el tipo es medicamento' })
  medicamento?: CreateProductoMedicamentoDto;

  @ValidateNested()
  @Type(() => CreateProductoInsumoMedicoDto)
  @ValidateIf((o) => o.tipo === TipoProducto.INSUMO_MEDICO)
  @IsNotEmpty({ message: 'Los datos del insumo médico son requeridos cuando el tipo es insumo_medico' })
  insumoMedico?: CreateProductoInsumoMedicoDto;

  @ValidateNested()
  @Type(() => CreateProductoEquipoMedicoDto)
  @ValidateIf((o) => o.tipo === TipoProducto.EQUIPO_MEDICO)
  @IsNotEmpty({ message: 'Los datos del equipo médico son requeridos cuando el tipo es equipo_medico' })
  equipoMedico?: CreateProductoEquipoMedicoDto;
}

// Tipo helper para mapear el DTO a las entidades del dominio
export type CreateProductoVariantDto = CreateProductoMedicamentoDto | CreateProductoInsumoMedicoDto | CreateProductoEquipoMedicoDto;