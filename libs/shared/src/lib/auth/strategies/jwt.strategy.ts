import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'default_secret',
    });
  }

  async validate(payload: any) : Promise<JwtPayloadDto> {
    // Devuelve lo que aparecerá en req.user
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      pais: payload.pais,
      // puedes añadir más campos si tu payload los contiene
    };
  }
}
