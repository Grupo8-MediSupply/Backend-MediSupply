import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '@medi-supply/perfiles-dm';
import type { IUsuariosRepository } from '@medi-supply/perfiles-dm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioConsultaDto } from './dtos/response/usuario-consulta.dto';
import { JwtPayloadDto } from '@medi-supply/shared';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AppService {
  constructor(
    @Inject('IUsuariosRepository')
    private readonly usuariosRepository: IUsuariosRepository,
    private jwtService: JwtService,
    private configService: ConfigService
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

    const payload : JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      role: user.role,
      pais: user.pais,
    };
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    const algorithm = isProd ? 'RS256' : 'HS256';

    const token = await this.jwtService.signAsync(payload,{


      header: {
                kid: 'mymainkey-1', // 🔑 aquí pones el mismo que en tu JWKS
                alg: algorithm,
              }
    });

    return {
      access_token: token,
    };
  }


}
