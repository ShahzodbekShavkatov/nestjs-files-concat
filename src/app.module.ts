import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './filedata/file.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), FileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
