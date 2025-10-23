import { Expose, Type } from 'class-transformer';
import { PaisResponseDto } from '../../../paises/dtos/response/pais.response.dto';

export class TipoIdentificacionResponseDto {
  @Expose()
  id!: number;

  @Expose()
  nombre!: string;

  @Expose()
  abreviatura!: string;

  @Expose()
  paisId!: number;
}

export class ConfiguracionResponseDto {
  @Expose()
  @Type(() => PaisResponseDto)
  pais!: PaisResponseDto;

  @Expose()
  @Type(() => TipoIdentificacionResponseDto)
  tiposIdentificacion!: TipoIdentificacionResponseDto[];
}
