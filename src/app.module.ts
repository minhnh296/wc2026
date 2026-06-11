import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '@/common/config/env.validation';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { IsUniqueConstraint } from '@/common/decorators/is-unique.decorator';
import { IsExistConstraint } from '@/common/decorators/is-exist.decorator';
import { PlayersModule } from '@/modules/players/players.module';
import { CountriesModule } from './modules/countries/countries.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    PrismaModule,
    PlayersModule,
    CountriesModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [IsUniqueConstraint, IsExistConstraint],
})
export class AppModule { }
