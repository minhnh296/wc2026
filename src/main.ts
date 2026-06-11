import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ClassSerializerInterceptor, RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { requestStorage } from '@/common/utils/request-storage';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Lưu trữ context request phục vụ cho validation singleton
  app.use((req, res, next) => {
    requestStorage.run(req, next);
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }]
  })
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('World Cup 2026 API')
    .setDescription('The World Cup 2026 API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag("App")
    .addTag("Player", "Các API quản lý cầu thủ")
    .addTag("Country", "Các API quản lý quốc gia")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
