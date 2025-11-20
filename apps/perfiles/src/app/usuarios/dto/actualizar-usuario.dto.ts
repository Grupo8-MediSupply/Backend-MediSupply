import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateUsuarioDto {

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
