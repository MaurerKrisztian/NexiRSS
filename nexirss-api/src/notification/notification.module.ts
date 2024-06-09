import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from './models/push-subscription.schema';
import {
  PushNotification,
  PushNotificationSchema,
} from './models/push-notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
      { name: PushNotification.name, schema: PushNotificationSchema },
    ]),
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [MongooseModule],
})
export class NotificationModule {}
