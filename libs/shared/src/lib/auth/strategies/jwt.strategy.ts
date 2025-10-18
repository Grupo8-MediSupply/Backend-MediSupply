import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    // 🔑 En local usamos HS256 (clave secreta), en prod RS256 (clave pública)
    const secretOrKey = isProduction
      ? config.get<string>('JWT_PUBLIC_KEY') // desde Secret Manager o variable
      : config.get<string>('JWT_SECRET', 'default_secret');

    const algorithms = isProduction ? ['RS256'] : ['HS256'];

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      algorithms,
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
