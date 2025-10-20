import { Body, Controller, Post } from '@nestjs/common';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClientesService } from './clientes.service';

@Controller('v1/clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  async createCliente(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }
}
