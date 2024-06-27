import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as Parser from 'rss-parser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RssItem } from '../schemas/rss-item.schema';
import { Category, Feed } from '../schemas/feed.schema';
import { UserService } from '../../user/user.service';
import { FetchAllFeedsCronService } from './fetch-all-feeds-cron.service';
import { FetchRssFeedService } from './fetch-rss-feed.service';
import { IFeedSubscription } from '../../user/models/user.schema';

@Injectable()
export class RssFeedService {
  private readonly logger = new Logger(RssFeedService.name);
  private readonly parser: Parser;

  constructor(
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly fetchAllFeedsCronService: FetchAllFeedsCronService,
    private readonly fetchRssFeedService: FetchRssFeedService,
  ) {
    this.parser = new Parser({ customFields: { item: ['media:group'] } });
  }

  async fetchAndSaveAllRss(feedSubscriptions?: IFeedSubscription[]) {
    const feedIds = feedSubscriptions?.map((s) => {
      s.feed;
    });

    const feeds: Feed[] = await this.feedModel
      .find(feedIds ? { _id: { $in: feedIds } } : {})
      .exec();

    const fetchResults = await Promise.all(
      feeds.map(async (feed) => {
        return {
          update: await this.fetchRssFeedService.fetchAndSaveRss(feed.url),
          feed,
        };
      }),
    );
    return fetchResults;
  }

  async getAllFeeds(
    search: string,
    page: number,
    limit: number,
  ): Promise<{ feeds: Feed[]; totalPages: number }> {
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const feeds = await this.feedModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalFeeds = await this.feedModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalFeeds / limit);

    return { feeds, totalPages };
  }

  async getFeedsByIds(feedIds: string[]): Promise<Feed[]> {
    const objectIds = feedIds.map((id) => new Types.ObjectId(id));
    return this.feedModel.find({ _id: { $in: objectIds } }).exec();
  }

  async getFeedItems(feedId: string, page = 1, limit = 10): Promise<RssItem[]> {
    return this.rssItemModel
      .find({ feed: feedId }, { plot_embedding: 0 })
      .populate('feed')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async getItemById(id: string): Promise<RssItem> {
    return this.rssItemModel
      .findById(id, { plot_embedding: 0 })
      .populate('feed')
      .exec();
  }

  async replayEvent(id: string): Promise<RssItem> {
    const rssItem = await this.rssItemModel
      .findById(id, { plot_embedding: 0 })
      .exec();

    this.eventEmitter.emit('rss.item.new', rssItem.toObject());
    return rssItem;
  }

  async getAllFeedItemsOrderedByDate(): Promise<RssItem[]> {
    return this.rssItemModel
      .find({}, { plot_embedding: 0 })
      .sort({ pubDate: -1 })
      .exec();
  }

  async getItems(
    page: number,
    limit: number,
    feeds?: string[],
    category?: string,
    search?: string,
  ): Promise<RssItem[]> {
    const skip = (page - 1) * limit;
    const feedQuery: any = {};

    if (feeds) {
      feedQuery._id = { $in: feeds.map((id) => new Types.ObjectId(id)) };
    }

    if (category) {
      feedQuery.category = { $regex: new RegExp(category, 'i') }; // Case-insensitive regex
    }

    const matchingFeeds = await this.feedModel
      .find(feedQuery, { _id: 1 })
      .exec();
    const matchingFeedIds = matchingFeeds.map((feed) => feed._id);

    const itemQuery: any = {
      feed: { $in: matchingFeedIds },
    };

    if (search) {
      itemQuery.$or = [
        { title: { $regex: new RegExp(search, 'i') } }, // Case-insensitive regex for title
        { content: { $regex: new RegExp(search, 'i') } }, // Case-insensitive regex for content
      ];
    }

    return this.rssItemModel
      .find(itemQuery, { plot_embedding: 0 })
      .sort({ pubDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('feed')
      .exec();
  }

  async getItemsByCategory(category: string): Promise<RssItem[]> {
    const feeds = await this.feedModel.find({ category }).exec();
    const feedIds = feeds.map((feed) => feed._id);
    return this.rssItemModel
      .find({ feed: { $in: feedIds } }, { plot_embedding: 0 })
      .sort({ pubDate: -1 })
      .populate('feed')
      .exec();
  }

  async deleteFeedByIdOrLink(
    identifier: string,
  ): Promise<{ deleted: boolean }> {
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { url: identifier };
    const feed = await this.feedModel.findOneAndDelete(query).exec();

    if (feed) {
      await this.rssItemModel.deleteMany({ feed: feed._id }).exec();
      await this.userService.removeFeedFromUsers(feed._id);
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  }

  async updateFeedCategory(id: string, category: Category): Promise<Feed> {
    const feed = await this.feedModel.findById(id);
    if (!feed) {
      throw new Error('Feed not found');
    }
    feed.category = category;
    return feed.save();
  }

  async vectorSearch(
    query: string,
    category?: string,
    feedIds?: string[],
  ): Promise<RssItem[]> {
    const pipeline: any[] = [];

    pipeline.push(
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
      {
        $lookup: {
          from: 'feeds',
          localField: 'feed',
          foreignField: '_id',
          as: 'feed',
        },
      },
      {
        $unwind: '$feed',
      },
    );

    if (category && category !== 'all') {
      pipeline.push({
        $match: {
          'feed.category': category,
        },
      });
    }

    if (feedIds && feedIds.length > 0) {
      pipeline.push({
        $match: {
          'feed._id': { $in: feedIds.map((id) => new Types.ObjectId(id)) },
        },
      });
    }

    return this.rssItemModel.aggregate(pipeline).exec();
  }

  getFeedById(feedId: string) {
    return this.feedModel.findOne({ _id: feedId }).exec();
  }
}
