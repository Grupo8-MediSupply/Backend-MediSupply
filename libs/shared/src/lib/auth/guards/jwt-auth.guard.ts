import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtReadGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Permitir rutas públicas
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    // 1️⃣ Intentar leer el header inyectado por GCP
    const userInfoHeader = req.headers['x-apigateway-api-userinfo'];
    if (userInfoHeader) {
      try {
        req.user = JSON.parse(userInfoHeader); // claims ya validados
        return true;
      } catch {
        throw new UnauthorizedException('Error al leer la información del usuario en la nube');
      }
    }

    // 2️⃣ Si estamos en local, usar Authorization
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No se encontró token en Authorization');
    }

    try {
      req.user = jwt.decode(token); // decodifica sin validar
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
