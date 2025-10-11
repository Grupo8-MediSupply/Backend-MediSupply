import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class ProveedorResponseDto {
  @Expose()
  id?: string;

  @Expose()
  @IsString()
  nombreProveedor?: string;

  @Expose()
  @IsEmail()
  email?: string;

  @Expose()
  @IsString()
  pais?: string;

  constructor(id: string, nombreProveedor: string, email: string, pais: string) {
    this.id = id;
    this.nombreProveedor = nombreProveedor;
    this.email = email;
    this.pais = pais;
  }
}
