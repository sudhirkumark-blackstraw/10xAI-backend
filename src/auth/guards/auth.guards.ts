import { Injectable, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      accessType: 'offline',
      prompt: 'select_account'
    });
  }

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const activate = (super.canActivate(context) as Promise<boolean>);
    const request = context.switchToHttp().getRequest();
    
    activate.then(async () => {
      await super.logIn(request);
    });

    return activate;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err;
    }
    return user;
  }
}

export const Public = () => SetMetadata('isPublic', true);