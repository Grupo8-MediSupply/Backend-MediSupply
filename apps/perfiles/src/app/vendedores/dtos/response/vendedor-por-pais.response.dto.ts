import { Expose, Type } from 'class-transformer';
import { IsEmail, IsInt, IsString, IsUUID, Length } from 'class-validator';

export class VendedorPorPaisResponseDto {
  @Expose()
  @IsUUID('4')
  id!: string;

  @Expose()
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @Type(() => Number)
  @IsInt()
  paisId!: number;

  constructor(id: string, nombre: string, email: string, paisId: number) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.paisId = paisId;
  }
}
