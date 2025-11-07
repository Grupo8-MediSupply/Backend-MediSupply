import { ApiProperty } from '@nestjs/swagger';
import type { Ubicacion } from '@medi-supply/core';

export class ClienteDto {
  @ApiProperty({ example: '955d164d-0e4c-4393-9c35-6ef732e26411' })
  id!: string;

  @ApiProperty({ example: 'Cliente de Prueba' })
  nombre!: string;

  @ApiProperty({ example: 'Bogotá, Colombia' })
  ubicacion!: Ubicacion | undefined;

  constructor(partial: Partial<ClienteDto>) {
    Object.assign(this, partial);
  }
}

export class VisitaDetailResponseDto {
  @ApiProperty({ example: 'd904b57f-949e-4e0b-ba87-ff7938721b1b' })
  id!: string;

  @ApiProperty({ example: '2025-11-07T00:06:21.911Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-07T00:06:21.911Z' })
  updatedAt!: string;

  @ApiProperty({ example: 'PROGRAMADA' })
  estado!: string;

  @ApiProperty({ type: ClienteDto })
  cliente!: ClienteDto;

  @ApiProperty({ example: '45800d22-e22d-4fd7-8f08-a32056a414f9' })
  vendedorId!: string;

  @ApiProperty({ example: '2025-10-10T00:00:00.000Z' })
  fechaVisita!: string;

  @ApiProperty({ example: 'Comentarios de prueba' })
  comentarios!: string | undefined;

  constructor(partial: Partial<VisitaDetailResponseDto>) {
    // Si el cliente viene como objeto, lo instanciamos con su clase
    if (partial.cliente) {
      this.cliente = new ClienteDto(partial.cliente);
    }
    Object.assign(this, partial);
  }
}