import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';
import * as process from 'node:process';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from 'rxjs';
import { Model } from 'mongoose';
import { PushSubscription } from './models/push-subscription.schema';
import { PushNotification } from './models/push-notification.schema';

@Injectable()
export class NotificationsService {
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

  async subscribe(
    userId: string,
    subscriptionData: {
      endpoint: string;
      keys: { auth: string; p256dh: string };
    },
  ) {
    const subscriptionDoc = await this.subscriptionModel.findOne({ userId });
    if (!subscriptionDoc) {
      const subscription = new this.subscriptionModel({
        userId,
        ...subscriptionData,
      });
      return await subscription.save();
    }
    return subscriptionDoc.set(subscriptionData).save();
  }

  async sendNotification(message: string, userIds: string[]) {
    for (const userId of userIds) {
      const subscriptions = await this.subscriptionModel.find({ userId });
      if (!subscriptions.length) {
        console.error(`No subscriptions for user ${userId}`);
        continue;
      }

      const payload = JSON.stringify({ title: 'New Notification', message });
      for (const subscription of subscriptions) {
        try {
          await webPush.sendNotification(subscription.toObject(), payload);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }

      const notification = new this.notificationModel({
        userId,
        message,
        sent: true,
      });
      await notification.save();
    }

    return { message: 'Notifications sent', content: message };
  }

  async getNotifications(userId: string) {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 });
  }
}
