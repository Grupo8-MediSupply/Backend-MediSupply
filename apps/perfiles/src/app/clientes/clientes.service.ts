import { Inject, Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClienteResponseDto } from './dtos/response/cliente.response.dto';
import type { IClienteRepository} from '@medi-supply/perfiles-dm';
import { Cliente } from '@medi-supply/perfiles-dm';

@Injectable()
export class ClientesService {
  constructor(
    @Inject('IClienteRepository')
    private readonly repo: IClienteRepository,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<ClienteResponseDto> {
    const cliente = new Cliente({
      email: createClienteDto.email,
      rolId: 30, 
      paisId: 10, 
      password: 'cliente_default$123',
      nombre: createClienteDto.nombre,
      tipoInstitucion: createClienteDto.tipoInstitucion,
      clasificacion: createClienteDto.clasificacion,
      responsableContacto: createClienteDto.responsableContacto,
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
}
