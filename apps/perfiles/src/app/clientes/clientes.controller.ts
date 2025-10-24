// ...existing code...
import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClientesService } from './clientes.service';
import { Public, Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import { ApiTags, ApiOperation, ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ClienteResponseDto } from './dtos/response/cliente.response.dto';

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

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR)
  @ApiOperation({
    summary: 'Listar clientes asociados al vendedor autenticado',
  })
  @ApiOkResponse({ type: ClienteResponseDto, isArray: true })
  @Get()
  async listarClientes(@User() user: JwtPayloadDto) {
    return this.clientesService.listarPorVendedor(user.sub);
  }
}
