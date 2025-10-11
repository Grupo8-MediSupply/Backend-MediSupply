// ...existing code...
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class VendedorResponseDto {
  @Expose()
  @IsEmail()
  email?: string;

  @Expose()
  @IsString()
  @Length(1, 100)
  paisCreacion?: string;

  constructor(email:string, paisCreacion:string) {
    this.email = email;
    this.paisCreacion = paisCreacion;
  }

    
}
