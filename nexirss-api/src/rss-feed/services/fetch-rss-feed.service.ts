import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import * as Parser from 'rss-parser';
import { InjectModel } from '@nestjs/mongoose';
import { RssItem } from '../schemas/rss-item.schema';
import { Model } from 'mongoose';
import { Feed } from '../schemas/feed.schema';
import { User } from '../../user/models/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class FetchRssFeedService {
  private readonly logger = new Logger(FetchRssFeedService.name);
  private readonly parser: Parser = new Parser({
    customFields: { item: ['media:group'] },
  });

  constructor(
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {}

  async fetchAndSaveRss(
    url: string,
    userId?: string,
    category?: string,
    maxItems = 3,
  ): Promise<{ newItems: number; totalItems: number }> {
    try {
      const feed = await this.getOrCreateFeed(url, category, userId);
      const feedData = await this.parser.parseURL(url);
      const newItems = await this.processFeedItems(
        feedData,
        feed._id,
        maxItems,
      );
      return { newItems, totalItems: feedData.items.length };
    } catch (error) {
      this.handleFetchError(url, error);
    }
  }

  private async getOrCreateFeed(
    url: string,
    category?: string,
    userId?: string,
  ) {
    let feed = await this.feedModel.findOne({ url });
    if (!feed) {
      const feedData = await this.parser.parseURL(url);
      feed = await this.createFeed(feedData, url, category);
      if (userId) {
        await this.userService.addFeedToUser(userId, feed._id);
      }
    } else {
      if (category) {
        feed.category = category;
      }
      await feed.save();
    }
    return feed;
  }

  private async createFeed(feedData, url: string, category?: string) {
    const image = this.getImage(feedData);
    const feed = new this.feedModel({
      url,
      title: feedData.title,
      description: feedData.description,
      image,
      category,
    });
    return feed.save();
  }

  private getImage(feedData) {
    if (feedData.image !== undefined) {
      return typeof feedData.image === 'string'
        ? feedData.image
        : feedData.image?.url;
    }
    return feedData.image || feedData?.itunes?.image;
  }

  private async processFeedItems(feedData, feedId: string, maxItems: number) {
    let newItems = 0;
    const processData = feedData.items.slice(0, maxItems);

    for (const item of processData) {
      if (!(await this.rssItemModel.findOne({ link: item.link }))) {
        const rssItem = await this.createRssItem(item, feedId);
        this.eventEmitter.emit('rss.item.new', rssItem.toObject());
        newItems++;
      }
    }

    if (newItems > 0) {
      this.logger.verbose(
        `New feed items found for "${feedData.title}": ${newItems}`,
      );
    }
    return newItems;
  }

  private async createRssItem(item, feedId: string) {
    const audioInfo = item.enclosure
      ? {
          length: item.enclosure.length,
          type: item.enclosure.type,
          url: item.enclosure.url,
        }
      : undefined;

    const rssItem = new this.rssItemModel({
      title: item.title,
      link: item.link,
      image:
        item.image || item?.['media:group']?.['media:thumbnail'][0]?.['$']?.url,
      pubDate: new Date(item.pubDate),
      content:
        item['content:encoded'] ||
        item.content ||
        item.description ||
        item.contentSnippet ||
        item?.['media:group']?.['media:description'][0],
      feed: feedId,
      audioInfo,
    });

    return rssItem.save();
  }

  private handleFetchError(url: string, error: Error) {
    console.error('RssFeedService', error.message);
    this.logger.error(`Failed to fetch RSS feed from ${url}`, error.stack);
    throw new Error(`Failed to fetch RSS feed from ${url}`);
  }
}
