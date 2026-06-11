import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@/config/config.service';

export interface JwtPayload {
  sub: string;
  username: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class TokenService {
  // In-memory blacklist – thay bằng Redis khi scale
  private readonly blacklist = new Set<string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  addToBlacklist(token: string): void {
    this.blacklist.add(token);
  }

  async signAccessToken(payload: Omit<JwtPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'access' },
      {
        secret: this.config.jwt.secret,
        expiresIn: this.config.jwt.expiration as JwtSignOptions['expiresIn'],
      },
    );
  }

  async signRefreshToken(payload: Omit<JwtPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpiration as JwtSignOptions['expiresIn'],
      },
    );
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    if (this.isBlacklisted(token)) {
      throw new UnauthorizedException('Token đã bị thu hồi.');
    }
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwt.secret,
      });
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    if (this.isBlacklisted(token)) {
      throw new UnauthorizedException('Token đã bị thu hồi.');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwt.refreshSecret,
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token không hợp lệ.');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
