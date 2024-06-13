import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../schemas/rss-item.schema';
import { NotificationsService } from '../../notification/notifications.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/models/user.schema';
import { Model } from 'mongoose';
import { Feed } from '../schemas/feed.schema';

@Injectable()
export class FeedNotificationService {
  private readonly logger = new Logger(FeedNotificationService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
  ) {}

  @OnEvent('rss.item.new')
  async handleNewRssItemEvent(item: RssItem) {
    this.logger.log(
      `New RSS item added. Feed ID: ${item._id}, Title: ${item.title}`,
    );

    try {
      const feed: Feed = await this.feedModel
        .findOne({ _id: item.feed })
        .exec();

      const users = await this.userModel
        .find({
          feedSubscriptions: {
            $elemMatch: {
              feed: item.feed,
              notifications: true,
            },
          },
        })
        .exec();

      this.logger.debug(
        `found users: ${users.map((user: User) => user.id).join(',')}`,
      );
      if (users.length > 0) {
        const userIds = users.map((user) => user._id);
        this.logger.debug('Notify users: ', userIds.join(','));
        this.notificationsService.sendNotification(
          {
            image: `${feed.image}`,
            icon: item.image || feed.image,
            title: `${feed.title}  - ${feed?.category?.toLowerCase()}`,
            body: item.title,
            data: { url: item.link },
          },
          userIds,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending notifications: ${error.message}`);
    }
  }
}
