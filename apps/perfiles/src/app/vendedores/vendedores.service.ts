import { Inject, Injectable } from '@nestjs/common';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import type { IVendedorRepository } from '@medi-supply/perfiles-dm';
import { Vendedor } from '@medi-supply/perfiles-dm';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto, RolesEnum } from '@medi-supply/shared';

@Injectable()
export class VendedoresService {
  constructor(
    @Inject('IVendedorRepository')
    private readonly repo: IVendedorRepository
  ) {}

  async create(
    createVendedorDto: CreateVendedorDto,
    UserRequest: JwtPayloadDto
  ): Promise<VendedorResponseDto> {
    const props = {
      email: createVendedorDto.email,
      nombre: createVendedorDto.nombre,
      rolId: RolesEnum.VENDEDOR,
      paisId: UserRequest.pais,
      password: await bcrypt.hash('deploy_32316571$', 10),
      identificacion: createVendedorDto.identificacion,
      tipoIdentificacion: createVendedorDto.tipoIdentificacion,
    };
    const vendedor = new Vendedor(props);
    const createdVendedor = await this.repo.create(vendedor);

    return new VendedorResponseDto(
      createdVendedor.email.Value,
      createdVendedor.paisId.toString()
    );
  }
}
