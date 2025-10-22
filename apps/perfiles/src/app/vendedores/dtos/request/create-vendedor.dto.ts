import { IsString, IsEmail, Length, Matches, IsNumber } from 'class-validator';

export class CreateVendedorDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(5, 50)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'La identificación solo puede contener letras y números',
  })
  identificacion!: string;

  @IsNumber()
  tipoIdentificacion!: number;

}
