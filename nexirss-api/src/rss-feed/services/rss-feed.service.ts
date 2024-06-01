import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as Parser from 'rss-parser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RssItem } from '../schemas/rss-item.schema';
import { Feed } from '../schemas/feed.schema';

@Injectable()
export class RssFeedService {
  private readonly logger = new Logger(RssFeedService.name);
  private readonly parser: Parser;

  constructor(
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.parser = new Parser();
  }

  async fetchAndSaveRss(
    url: string,
    category: string,
  ): Promise<{ newItems: number; totalItems: number }> {
    try {
      let feed = await this.feedModel.findOne({ url });
      if (!feed) {
        const feedData = await this.parser.parseURL(url);
        feed = new this.feedModel({
          url,
          title: feedData.title,
          category,
        });
        await feed.save();
      } else {
        // Update the category if the feed already exists
        feed.category = category;
        await feed.save();
      }

      const feedData = await this.parser.parseURL(url);
      let newItems = 0;

      for (const item of feedData.items) {
        const existingItem = await this.rssItemModel.findOne({
          link: item.link,
        });
        if (!existingItem) {
          const rssItem = new this.rssItemModel({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            content: item.contentSnippet,
            feed: feed._id,
          });
          await rssItem.save();
          newItems++;
          this.eventEmitter.emit('rss.item.new', rssItem);
        }
      }

      return { newItems, totalItems: feedData.items.length };
    } catch (error) {
      console.error('RssFeedService', error.message);
      this.logger.error(`Failed to fetch RSS feed from ${url}`, error.stack);
      throw new Error(`Failed to fetch RSS feed from ${url}`);
    }
  }

  async getAllFeeds(): Promise<Feed[]> {
    return this.feedModel.find().exec();
  }

  async getFeedItems(feedId: string): Promise<RssItem[]> {
    return this.rssItemModel.find({ feed: feedId }).exec();
  }

  async getItemById(id: string): Promise<RssItem> {
    return this.rssItemModel.findById(id).exec();
  }

  async getAllFeedItemsOrderedByDate(): Promise<RssItem[]> {
    return this.rssItemModel.find().sort({ pubDate: -1 }).exec();
  }

  async getItems(page: number, limit: number): Promise<RssItem[]> {
    const skip = (page - 1) * limit;
    return this.rssItemModel
      .find()
      .sort({ pubDate: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getItemsByCategory(category: string): Promise<RssItem[]> {
    const feeds = await this.feedModel.find({ category }).exec();
    const feedIds = feeds.map((feed) => feed._id);
    return this.rssItemModel
      .find({ feed: { $in: feedIds } })
      .sort({ pubDate: -1 })
      .exec();
  }

  async deleteFeedByIdOrLink(
    identifier: string,
  ): Promise<{ deleted: boolean }> {
    let feed;
    if (Types.ObjectId.isValid(identifier)) {
      feed = await this.feedModel.findByIdAndDelete(identifier).exec();
    } else {
      feed = await this.feedModel.findOneAndDelete({ url: identifier }).exec();
    }

    if (feed) {
      await this.rssItemModel.deleteMany({ feed: feed._id }).exec();
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  }

  async updateFeedCategory(id: string, category: string): Promise<Feed> {
    const feed = await this.feedModel.findById(id);
    if (!feed) {
      throw new Error('Feed not found');
    }
    feed.category = category;
    return feed.save();
  }

  async vectorSearch(query: string): Promise<RssItem[]> {
    return this.rssItemModel
      .aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: query,
              path: {
                wildcard: '*',
              },
            },
          },
        },
        {
          $project: {
            plot_embedding: 0,
          },
        },
      ])
      .exec();
  }
}
