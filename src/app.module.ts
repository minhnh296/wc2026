import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule } from '@/config/config.module';
import { envValidationSchema } from '@/config/env.validation';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { IsUniqueConstraint } from '@/common/decorators/is-unique.decorator';
import { IsExistConstraint } from '@/common/decorators/is-exist.decorator';
import { PlayersModule } from '@/modules/players/players.module';
import { CountriesModule } from './modules/countries/countries.module';
import { UploadModule } from '@/shared/upload/upload.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ConfigModule,
    PrismaModule,
    PlayersModule,
    CountriesModule,
    UploadModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [IsUniqueConstraint, IsExistConstraint],
})
export class AppModule { }
