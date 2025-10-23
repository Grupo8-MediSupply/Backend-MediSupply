// ...existing code...
import { IsNumber, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ example: 'Laboratorios ABC', description: 'Nombre completo del cliente', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @ApiProperty({ example: 'J-12345678-9', description: 'Identificación del cliente (Cédula/RIF/etc.)' })
  @IsString()
  identificacion!: string;

  @ApiProperty({ example: 1, description: 'Tipo de identificación (id referencial)' })
  @IsNumber()
  tipoIdentificacion!: number;

  @ApiProperty({ example: 'Privada', description: 'Tipo de institución' })
  @IsString()
  tipoInstitucion!: string;

  @ApiProperty({ example: 'Distribuidor', description: 'Clasificación del cliente' })
  @IsString()
  clasificacion!: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Persona responsable de contacto' })
  @IsString()
  responsableContacto!: string;

  @ApiProperty({ example: 58, description: 'ID del país (referencia)' })
  @IsNumber()
  pais!: number;

  @ApiProperty({ example: 'contacto@cliente.com', description: 'Correo electrónico de contacto' })
  @IsString()
  email!: string;

  @ApiProperty({
    example: 'Passw0rd1',
    description: 'Contraseña (8-20 caracteres, al menos una letra y un número)',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, { message: 'La contraseña debe tener entre 8 y 20 caracteres, y contener al menos una letra y un número.' })
  password!: string;
}