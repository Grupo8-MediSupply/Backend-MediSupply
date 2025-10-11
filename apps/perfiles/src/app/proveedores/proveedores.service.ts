import { Inject, Injectable } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedorResponseDto } from './dtos/response/proveedor.response.dto';
import type { IProveedorRepository } from '@medi-supply/perfiles-dm';
import { Proveedor } from '@medi-supply/perfiles-dm';

@Injectable()
export class ProveedoresService {
  constructor(
    @Inject('IProveedorRepository')
    private readonly repo: IProveedorRepository
  ) {}

  async create(createProveedorDto: CreateProveedorDto): Promise<ProveedorResponseDto> {
    const props = {
        email: createProveedorDto.email,
        nombreProveedor: createProveedorDto.nombreProveedor,
        numeroIdentificacion: createProveedorDto.numeroIdentificacion,
        pais: createProveedorDto.pais,
        contactoPrincipal: createProveedorDto.contactoPrincipal,
        telefonoContacto: createProveedorDto.telefonoContacto,
        rolId: 2, 
        paisId: 1, 
        password: 'Proveedor123$', 
};

    const proveedor = new Proveedor(props);
    const createdProveedor = await this.repo.create(proveedor);

    return new ProveedorResponseDto(
      createdProveedor.id!,
      createdProveedor.nombreProveedor.Value,
      createdProveedor.email.Value,
      createdProveedor.pais
    );
  }
}
