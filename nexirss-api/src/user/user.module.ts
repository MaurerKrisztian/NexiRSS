import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './models/user.schema';
import { UserController } from './controllers/user.controller';
import { AiAnalyticsController } from './controllers/ai-analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService],
  controllers: [UserController, AiAnalyticsController],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
