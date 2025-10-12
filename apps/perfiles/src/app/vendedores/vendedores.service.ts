import { Inject, Injectable } from '@nestjs/common';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import type { IVendedorRepository } from '@medi-supply/perfiles-dm';
import { Vendedor } from '@medi-supply/perfiles-dm';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';

@Injectable()
export class VendedoresService {
  constructor(
    @Inject('IVendedorRepository')
    private readonly repo: IVendedorRepository
  ) {}

  async create(
    createVendedorDto: CreateVendedorDto
  ): Promise<VendedorResponseDto> {
    const props = {
      email: createVendedorDto.email,
      territorio: createVendedorDto.territorio,
      nombre: createVendedorDto.nombre,
      rolId: 1,
      paisId: 1,
      password: 'testeo345&',
    };
    const vendedor = new Vendedor(props);
    const createdVendedor = await this.repo.create(vendedor);

    return new VendedorResponseDto(
      createdVendedor.email.Value,
      createdVendedor.paisId.toString()
    );
  }
}
