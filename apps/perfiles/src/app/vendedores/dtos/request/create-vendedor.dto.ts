import { IsString, IsEmail, Length, Matches } from 'class-validator';

export class CreateVendedorDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsEmail()
  email!: string;

}
