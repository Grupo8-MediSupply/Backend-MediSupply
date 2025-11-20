import { Inject, Injectable } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedorResponseDto } from './dtos/response/proveedor.response.dto';
import type { IProveedorRepository } from '@medi-supply/perfiles-dm';
import { Proveedor } from '@medi-supply/perfiles-dm';
import { RolesEnum } from '@medi-supply/shared';
import * as bcrypt from 'bcrypt';
import { HistorialCompraFiltros } from '@medi-supply/perfiles-dm';
import { CompraProveedorResponseDto } from './dtos/response/compra-proveedor.response.dto';
import { HistorialComprasQueryDto } from './dtos/request/historial-compras.query.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @Inject('IProveedorRepository')
    private readonly repo: IProveedorRepository
  ) {}

  async findByPais(pais: number) {
    const proveedores = await this.repo.findByPais(pais);
    return proveedores.map(proveedor => new ProveedorResponseDto(
      proveedor.id!,
      proveedor.nombreProveedor.Value,
      proveedor.email.Value,
      proveedor.paisId,
      proveedor.tipoIdentificacion,
      proveedor.identificacion
    ));
  }


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
      createdProveedor.paisId,
      createdProveedor.tipoIdentificacion,
      createdProveedor.identificacion
    );
  }

  async obtenerHistorialCompras(query: HistorialComprasQueryDto, paisPorDefecto?: number) {
    const filtros: HistorialCompraFiltros = {
      proveedorId: query.proveedorId,
      paisId: query.pais ?? paisPorDefecto,
      fechaInicio: query.fechaInicio ? new Date(query.fechaInicio) : undefined,
      fechaFin: query.fechaFin ? new Date(query.fechaFin) : undefined,
    };

    const compras = await this.repo.obtenerHistorialCompras(filtros);

    if (!compras.length) {
      return { mensaje: 'No hay compras registradas para los filtros seleccionados.' };
    }

    return compras.map(
      (compra) =>
        new CompraProveedorResponseDto(
          compra.producto,
          compra.cantidad,
          compra.valorTotal,
          compra.fechaCompra,
          compra.proveedorId,
        ),
    );
  }
}
