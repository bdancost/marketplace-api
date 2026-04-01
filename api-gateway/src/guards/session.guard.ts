import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../service/auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();

    const rawSessionToken = request.headers['x-session-token'];
    const sessionToken = Array.isArray(rawSessionToken)
      ? rawSessionToken[0]
      : rawSessionToken;

    if (!sessionToken) {
      throw new UnauthorizedException('Session token required');
    }

    try {
      const session = await this.authService.validateSessionToken(sessionToken);

      if (!session.valid || !session.user) {
        throw new UnauthorizedException('Invalid session token');
      }

      request.user = session.user;
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
