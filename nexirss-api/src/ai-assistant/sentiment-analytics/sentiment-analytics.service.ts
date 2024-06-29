import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../../rss-feed/schemas/rss-item.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SentimentAnalyticsService {
  private readonly logger = new Logger(SentimentAnalyticsService.name);

  constructor(
    @InjectModel(RssItem.name) private readonly rssItem: Model<RssItem>,
  ) {}

  @OnEvent('rss.item.new')
  async setSentimentScore(item: RssItem) {
    this.logger.debug(`analyze new item: ${item.feed}:${item.title}`);
  }
}
