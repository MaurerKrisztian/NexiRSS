import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async removeFeedFromUsers(feedId: string) {
    return this.userModel.updateOne({}, { $pull: { feeds: feedId } });
  }

  async addFeedToUser(userId: string, feedId: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { feeds: feedId } },
    );
  }

  async removeFeedFromUser(userId: string, feedId: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $pull: { feeds: feedId } },
    );
  }
}
