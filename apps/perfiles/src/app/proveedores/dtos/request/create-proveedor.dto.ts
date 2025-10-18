import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @Length(2, 100, { message: 'El nombre del proveedor debe tener entre 2 y 100 caracteres.' })
  nombreProveedor!: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de identificación es obligatorio.' })
  @Matches(/^[A-Za-z0-9\-\s]+$/, { message: 'El número de identificación solo puede contener letras, números y guiones.' })
  numeroIdentificacion!: string;

  @IsString()
  @IsNotEmpty({ message: 'El país es obligatorio.' })
  pais!: string;

  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido.' })
  email!: string;

  @IsString()
  @Length(2, 100, { message: 'El nombre del contacto principal debe tener entre 2 y 100 caracteres.' })
  contactoPrincipal!: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El teléfono solo puede contener números, espacios y símbolos como + o -.' })
  telefonoContacto!: string;
}
