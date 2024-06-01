import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedModule } from './rss-feed/rss-feed.module';
import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URL),
    RssFeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
