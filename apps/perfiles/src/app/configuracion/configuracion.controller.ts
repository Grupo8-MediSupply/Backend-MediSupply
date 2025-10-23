import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { RolesGuard, Roles, RolesEnum, User } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';

@UseGuards(RolesGuard)
@Controller('v1/configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Roles(RolesEnum.ADMIN, RolesEnum.VENDEDOR, RolesEnum.PROVEEDOR,RolesEnum.CLIENTE)
  @Get()
  async getConfiguracion(@User() user: JwtPayloadDto) {
    return this.configuracionService.getConfiguracionPorPais(user.pais);
  }
}
