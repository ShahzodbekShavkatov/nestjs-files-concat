import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors()
  app.useStaticAssets(join(__dirname, '../files'), {
    index: false,
    redirect: false
  })
  app.useStaticAssets(join(__dirname, '../concatFiles'), {
    index: false,
    redirect: false
  })

  app.useGlobalPipes(new ValidationPipe())

  const options = new DocumentBuilder()
  .setTitle('API')
  .setDescription('Files swagger')
  .setVersion('1.0')
  .setBasePath('api')
  .addBearerAuth()
  .addTag('Demo')
  .build()
const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup('doc', app, document)

  await app.listen(3000);
}
bootstrap();
