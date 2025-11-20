import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { UpdateUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('v1/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  getUsuarios(@User() jwt: JwtPayloadDto) {
    return this.usuariosService.obtenerUsuariosPorPais(jwt.pais);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  actualizarUsuario(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @User() jwt: JwtPayloadDto) {
    return this.usuariosService.actualizarUsuario(id, dto);
  }
}
