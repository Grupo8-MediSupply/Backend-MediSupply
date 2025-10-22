import { Inject, Injectable } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedorResponseDto } from './dtos/response/proveedor.response.dto';
import type { IProveedorRepository } from '@medi-supply/perfiles-dm';
import { Proveedor } from '@medi-supply/perfiles-dm';
import { RolesEnum } from '@medi-supply/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProveedoresService {
  constructor(
    @Inject('IProveedorRepository')
    private readonly repo: IProveedorRepository
  ) {}

  async create(createProveedorDto: CreateProveedorDto, paisId: number): Promise<ProveedorResponseDto> {
    const props = {
        email: createProveedorDto.email,
        nombreProveedor: createProveedorDto.nombreProveedor,
        numeroIdentificacion: createProveedorDto.numeroIdentificacion,
        contactoPrincipal: createProveedorDto.contactoPrincipal,
        telefonoContacto: createProveedorDto.telefonoContacto,
        rolId: RolesEnum.PROVEEDOR, 
        paisId: createProveedorDto.pais, 
        password: await bcrypt.hash('deploy_32316571$', 10),
        tipoIdentificacion: createProveedorDto.tipoIdentificacion, 
};

    const proveedor = new Proveedor(props);
    const createdProveedor = await this.repo.create(proveedor);

    return new ProveedorResponseDto(
      createdProveedor.id!,
      createdProveedor.nombreProveedor.Value,
      createdProveedor.email.Value,
      createdProveedor.paisId
    );
  }
}
