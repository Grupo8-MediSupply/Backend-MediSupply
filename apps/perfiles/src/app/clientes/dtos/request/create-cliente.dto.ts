import { IsString, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsString()
  tipoInstitucion!: string;

  @IsString()
  clasificacion!: string;

  @IsString()
  responsableContacto!: string;

  @IsString()
  email!: string;
}
