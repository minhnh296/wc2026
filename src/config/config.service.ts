import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService extends NestConfigService {
  application = {
    node_env: this.get<string>('NODE_ENV') ?? 'development',
    port: this.get<number>('PORT') ? Number(this.get<number>('PORT')) : 3000,
  };

  jwt = {
    secret: this.getOrThrow<string>('JWT_SECRET'),
    expiration: this.get<string>('JWT_EXPIRATION') ?? '15m',
    refreshSecret: this.getOrThrow<string>('JWT_REFRESH_SECRET'),
    refreshExpiration: this.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d',
  };
}
