import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestInfo } from '../types/request-info';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestInfo>();

    if (!requiredRoles) return true;

    if (!request.user) {
  throw new ForbiddenException('User not authenticated');
}

    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Access denied for your role'); // custom message
    }
    return true;
  }
}
