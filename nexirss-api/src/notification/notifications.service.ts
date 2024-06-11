import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';
import * as process from 'node:process';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from 'rxjs';
import { Model } from 'mongoose';
import { PushSubscription } from './models/push-subscription.schema';
import { PushNotification } from './models/push-notification.schema';

export interface INotificationData {
  title: string; // The title of the notification
  body: string; // The body content of the notification
  icon?: string; // URL to the icon image
  image?: string; // URL to the main image (optional)
  badge?: string; // URL to the badge icon (optional)
  data?: {
    url: string; // URL to redirect to when notification is clicked
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidKeys = {
    publicKey: process.env.NOTIFICATION_PUBLIC_KEY,
    privateKey: process.env.NOTIFICATION_PRIVATE_KEY,
  };
  constructor(
    @InjectModel(PushSubscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PushNotification.name)
    private notificationModel: Model<Notification>,
  ) {
    webPush.setVapidDetails(
      'mailto:maurerkrisztian@gmail.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey,
    );
  }

  getSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ userId: userId });
  }

  deleteSubscription(userId: string, subscriptionId: string): Promise<unknown> {
    return this.subscriptionModel.deleteOne({
      userId: userId,
      _id: subscriptionId,
    });
  }

  async subscribe(
    userId: string,
    subscriptionData: Pick<
      PushSubscription,
      'deviceInfo' | 'endpoint' | 'keys'
    >,
  ) {
    const subscription = new this.subscriptionModel({
      userId,
      ...subscriptionData,
    });
    return await subscription.save();
  }

  async sendNotification(data: INotificationData, userIds: string[]) {
    for (const userId of userIds) {
      const subscriptions = await this.subscriptionModel.find({ userId });
      if (!subscriptions.length) {
        this.logger.warn(`No subscriptions for user ${userId}`);
        continue;
      }

      // const payload = JSON.stringify({
      //   title: 'New Notification',
      //   message,
      //   body: 'I am testing the text',
      //   image:
      //     'https://www.shutterstock.com/image-vector/sd-anime-stylekemonomimi-cute-cartoon-260nw-2460673739.jpg',
      //   data: { url: 'https://www.DISCORD.com' },
      // });
      for (const subscription of subscriptions) {
        try {
          await webPush.sendNotification(
            subscription.toObject(),
            JSON.stringify(data),
          );
        } catch (error) {
          this.logger.error(`Error sending notification ${error.message}`);
        }
      }

      const notification = new this.notificationModel({
        userId,
        message: data.body, // todo: save all the data
        sent: true,
      });
      await notification.save();
    }

    return { message: 'Notifications sent', content: data };
  }

  async getNotifications(userId: string) {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 });
  }
}
