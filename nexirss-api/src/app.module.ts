import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedModule } from './rss-feed/rss-feed.module';
import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { OpenAiModule } from './ai-assistant/openai.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    OpenAiModule,
    RssFeedModule,
    AuthModule,
    UserModule,
    NotificationModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [
    AuthModule,
    UserModule,
    RssFeedModule,
    OpenAiModule,
    NotificationModule,
  ],
})
export class AppModule {}
