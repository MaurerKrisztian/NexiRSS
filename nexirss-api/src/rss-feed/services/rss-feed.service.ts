import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as Parser from 'rss-parser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RssItem } from '../schemas/rss-item.schema';
import { Feed } from '../schemas/feed.schema';
import { User } from '../../user/models/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class RssFeedService {
  private readonly logger = new Logger(RssFeedService.name);
  private readonly parser: Parser;

  constructor(
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    this.parser = new Parser({ customFields: { item: ['media:group'] } });
  }

  async fetchAndSaveRss(
    url: string,
    userId?: string,
    category?: string,
    maxItems = 3,
  ): Promise<{ newItems: number; totalItems: number }> {
    try {
      let feed = await this.feedModel.findOne({ url });
      if (!feed) {
        const feedData = await this.parser.parseURL(url);
        console.log(JSON.stringify(feedData, null, 2));

        const getImage = (rss) => {
          if (feedData.image !== undefined) {
            return typeof feedData.image == 'string'
              ? feedData.image
              : feedData.image?.url;
          }
          return feedData.image || feedData?.itunes?.image;
        };
        feed = new this.feedModel({
          url,
          title: feedData.title,
          description: feedData.description,
          image: getImage(feedData),
          category,
        });
        const feedDoc = await feed.save();
        if (userId) {
          await this.userService.addFeedToUser(userId, feedDoc._id);
        }
      } else {
        // Update the category if the feed already exists
        if (category) {
          feed.category = category;
        }
        await feed.save();
      }

      const feedData = await this.parser.parseURL(url);
      // console.log(JSON.stringify(feedData, null, 2));
      let newItems = 0;

      const processData = feedData.items.slice(0, maxItems);
      for (const item of processData) {
        const existingItem = await this.rssItemModel.findOne({
          link: item.link,
        });
        if (!existingItem) {
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
              item.image ||
              item?.['media:group']?.['media:thumbnail'][0]?.['$']?.url,
            pubDate: new Date(item.pubDate),
            content:
              item['content:encoded'] ||
              item.content ||
              item.description ||
              item.contentSnippet ||
              item?.['media:group']?.['media:description'][0],
            feed: feed._id,
            audioInfo,
          });
          const res = await rssItem.save();
          console.log('res: ', res);
          newItems++;
          this.eventEmitter.emit('rss.item.new', rssItem);
        }
      }

      return { newItems, totalItems: processData.length };
    } catch (error) {
      console.error('RssFeedService', error.message);
      this.logger.error(`Failed to fetch RSS feed from ${url}`, error.stack);
      throw new Error(`Failed to fetch RSS feed from ${url}`);
    }
  }

  async fetchAndSaveAllRss(feedIds?: string[]) {
    const feeds: Feed[] = await this.feedModel
      .find(feedIds ? { _id: { $in: feedIds } } : {})
      .exec();

    console.log(feeds);
    const fetchResults = await Promise.all(
      feeds.map(async (feed) => {
        return { update: await this.fetchAndSaveRss(feed.url), feed };
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

  async getFeedItems(feedId: string): Promise<RssItem[]> {
    return this.rssItemModel
      .find({ feed: feedId }, { plot_embedding: 0 })
      .populate('feed')
      .exec();
  }

  async getItemById(id: string): Promise<RssItem> {
    return this.rssItemModel
      .findById(id, { plot_embedding: 0 })
      .populate('feed')
      .exec();
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
  ): Promise<RssItem[]> {
    const skip = (page - 1) * limit;
    return this.rssItemModel
      .find(
        feeds
          ? { feed: { $in: feeds.map((id) => new Types.ObjectId(id)) } }
          : {},
        {
          plot_embedding: 0,
        },
      )
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

  async updateFeedCategory(id: string, category: string): Promise<Feed> {
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
