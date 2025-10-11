import { IsString, IsEmail, Length, Matches } from 'class-validator';

export class CreateVendedorDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9]{1,3}$/, {
    message: 'territorio debe ser un código de país válido (1-3 caracteres)',
  })
  territorio!: string;
}
