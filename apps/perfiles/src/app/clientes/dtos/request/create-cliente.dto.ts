import { IsNumber, IsString, Length, Matches } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsString()
  identificacion!: string;

  @IsNumber()
  tipoIdentificacion!: number;

  @IsString()
  tipoInstitucion!: string;

  @IsString()
  clasificacion!: string;

  @IsString()
  responsableContacto!: string;

  @IsNumber()
  pais!: number;

  @IsString()
  email!: string;

  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, { message: 'La contraseña debe tener entre 8 y 20 caracteres, y contener al menos una letra y un número.' })
  password!: string;
}
