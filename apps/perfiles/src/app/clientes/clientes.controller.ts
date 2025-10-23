// ...existing code...
import { Body, Controller, Post } from '@nestjs/common';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClientesService } from './clientes.service';
import { Public } from '@medi-supply/shared';
import { ApiTags, ApiOperation, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('v1/clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @ApiOperation({ summary: 'Crear cliente' })
  @ApiBody({ type: CreateClienteDto })
  @ApiCreatedResponse({ description: 'Cliente creado correctamente.' })
  @Public()
  @Post()
  async createCliente(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }
}
