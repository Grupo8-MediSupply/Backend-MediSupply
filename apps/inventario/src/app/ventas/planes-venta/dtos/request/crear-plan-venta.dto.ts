import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearPlanVentaDto {
  @IsString()
  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @MaxLength(120, {
    message: 'El nombre del plan no puede exceder 120 caracteres.',
  })
  nombre!: string;

  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @IsUUID('4', { message: 'El vendedor seleccionado no es válido.' })
  vendedorId!: string;

  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'El monto/meta debe ser un número válido.' },
  )
  @IsPositive({ message: 'El monto/meta debe ser mayor a 0.' })
  montoMeta!: number;

  @IsString()
  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha de inicio debe tener el formato dd/mm/yyyy.',
  })
  inicio!: string;

  @IsString()
  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha de fin debe tener el formato dd/mm/yyyy.',
  })
  fin!: string;

  @IsString()
  @IsNotEmpty({ message: 'Este campo es requerido.' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres.',
  })
  descripcion!: string;
}
