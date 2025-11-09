import { Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString } from 'class-validator';

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
  @IsNumber()
  pais?: number;

  @Expose()
  @IsNumber()
  tipoIdentificacion?: number;

  @Expose()
  @IsString()
  identificacion?: string;

  constructor(id: string, nombreProveedor: string, email: string, pais: number, tipoIdentificacion: number, identificacion: string) {
    this.id = id;
    this.nombreProveedor = nombreProveedor;
    this.email = email;
    this.pais = pais;
    this.tipoIdentificacion = tipoIdentificacion;
    this.identificacion = identificacion;
  }
}
