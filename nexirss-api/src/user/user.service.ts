import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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
  ) {
    return this.userModel
      .updateOne(
        { _id: userId, 'feedSubscriptions.feed': new Types.ObjectId(feedId) },
        { $set: { 'feedSubscriptions.$.notifications': notifications } },
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
