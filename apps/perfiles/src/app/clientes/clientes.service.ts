import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClienteResponseDto } from './dtos/response/cliente.response.dto';
import type { IClienteRepository} from '@medi-supply/perfiles-dm';
import { Cliente } from '@medi-supply/perfiles-dm';
import { RolesEnum } from '@medi-supply/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientesService {
  constructor(
    @Inject('IClienteRepository')
    private readonly repo: IClienteRepository,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<ClienteResponseDto> {
    const cliente = new Cliente({
      email: createClienteDto.email,
      rolId: RolesEnum.CLIENTE, 
      paisId: createClienteDto.pais, 
      password: await bcrypt.hash(createClienteDto.password, 10),
      nombre: createClienteDto.nombre,
      tipoInstitucion: createClienteDto.tipoInstitucion,
      clasificacion: createClienteDto.clasificacion,
      responsableContacto: createClienteDto.responsableContacto,
      identificacion: createClienteDto.identificacion,
      tipoIdentificacion: createClienteDto.tipoIdentificacion,
    });

    const createdCliente = await this.repo.create(cliente);

    return new ClienteResponseDto(
      createdCliente.id!,
      createdCliente.nombre.Value,
      createdCliente.tipoInstitucion ?? '',
      createdCliente.clasificacion ?? '',
      createdCliente.responsableContacto ?? '',
    );
  }

  async findById(id: string): Promise<Cliente> {
    const cliente = await this.repo.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }
  
}
