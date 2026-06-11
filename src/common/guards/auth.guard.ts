import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { TokenService } from "@/modules/auth/token.service";
import { AuthService } from "@/modules/auth/auth.service";
import { UserEntity } from "@/modules/auth/entities/user.entity";
import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator";

interface RequestWithUser extends Request {
  user?: UserEntity;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Yêu cầu xác thực tài khoản.");
    }

    const payload = await this.tokenService.verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedException("Token không hợp lệ.");
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Tài khoản không tồn tại hoặc đã bị khóa.");
    }

    request.user = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
