import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async addAiAnalyticsSetting(
    userId: string,
    setting: { prompt: string; notifications: boolean; highlight: boolean },
  ) {
    const user = await this.userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $push: { aiAnalysisSettings: setting } },
        { new: true },
      )
      .exec();

    return user
      .toObject()
      .aiAnalysisSettings.find((i) => i.prompt == setting.prompt);
  }

  async updateAiAnalyticsSetting(
    userId: string,
    setting: {
      _id: string;
      prompt: string;
      notifications: boolean;
      highlight: boolean;
    },
  ) {
    return this.userModel
      .updateOne(
        { _id: userId, 'aiAnalysisSettings._id': setting._id },
        {
          $set: {
            'aiAnalysisSettings.$.prompt': setting.prompt,
            'aiAnalysisSettings.$.notifications': setting.notifications,
            'aiAnalysisSettings.$.highlight': setting.highlight,
          },
        },
      )
      .exec();
  }

  async deleteAiAnalyticsSetting(userId: string, settingId: string) {
    return this.userModel
      .updateOne(
        { _id: userId },
        { $pull: { aiAnalysisSettings: { _id: settingId } } },
      )
      .exec();
  }

  async removeFeedFromUsers(feedId: string) {
    return this.userModel
      .updateMany(
        { 'feedSubscriptions.feed': feedId },
        { $pull: { feedSubscriptions: { feed: feedId } } },
      )
      .exec();
  }

  async addFeedToUser(userId: string, feedId: string, notifications = false) {
    return this.userModel
      .updateOne(
        { _id: userId },
        {
          $addToSet: {
            feedSubscriptions: {
              feed: new Types.ObjectId(feedId),
              notifications,
            },
          },
        },
      )
      .exec();
  }

  async updateFeedSubscription(
    userId: string,
    feedId: string,
    notifications: boolean,
    enableAITrigger: boolean,
  ) {
    return this.userModel
      .updateOne(
        { _id: userId, 'feedSubscriptions.feed': new Types.ObjectId(feedId) },
        {
          $set: {
            'feedSubscriptions.$.notifications': notifications,
            'feedSubscriptions.$.enableAITrigger': enableAITrigger,
          },
        },
      )
      .exec();
  }

  async removeFeedFromUser(userId: string, feedId: string) {
    return this.userModel
      .updateOne(
        { _id: userId },
        { $pull: { feedSubscriptions: { feed: new Types.ObjectId(feedId) } } },
      )
      .exec();
  }
}
