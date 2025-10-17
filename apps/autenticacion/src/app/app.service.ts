import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '@medi-supply/perfiles-dm';
import type { IUsuariosRepository } from '@medi-supply/perfiles-dm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioConsultaDto } from './dtos/response/usuario-consulta.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('IUsuariosRepository')
    private readonly usuariosRepository: IUsuariosRepository,
    private jwtService: JwtService
  ) {}



  async validateUser(email: string, password: string): Promise<UsuarioConsultaDto> {
    const user: Usuario | null = await this.usuariosRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (!user.password)
      throw new UnauthorizedException(
        'El usuario no tiene contraseña registrada'
      );


    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Contraseña incorrecta');

    const { password: _, ...userData } = user;
    return {
      id: userData.id,
      email: userData.email.Value,
      role: userData.rolId,
      pais: userData.paisId
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      pais: user.pais,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }
}
