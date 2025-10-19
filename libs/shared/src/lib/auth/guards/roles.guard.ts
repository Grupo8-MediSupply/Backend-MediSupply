// libs/shared/src/lib/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 🔍 Lee los roles requeridos desde el decorador
    const requiredRoles = this.reflector.get<number[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // 🔍 Obtiene el usuario del request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user || user.role == null) {
      throw new ForbiddenException('No se encontró información del usuario');
    }

    // 🔍 Compara por número
    const hasRole = requiredRoles.includes(Number(user.role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. El rol ${user.role} no tiene permiso para esta acción.`,
      );
    }

    return true;
  }
}
