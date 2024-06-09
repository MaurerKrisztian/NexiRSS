import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Feed } from '../schemas/feed.schema';
import { Model } from 'mongoose';
import { FetchRssFeedService } from './fetch-rss-feed.service';
import { MeasureMethodAsync } from '../../utils/measure-method.decorator';
import * as ProgressBar from 'progress';

export function getCronJobEveryMinute(): string {
  return '* * * * *';
}
export function getCronJobEveryXSeconds(seconds: number): string {
  if (seconds <= 0 || seconds > 60) {
    throw new Error('Seconds must be between 1 and 60');
  }

  // Special case for every second
  if (seconds === 1) {
    return '* * * * * *';
  }

  return `*/${seconds} * * * * *`;
}

@Injectable()
export class FetchAllFeedsCronService {
  private readonly logger = new Logger(FetchAllFeedsCronService.name);

  constructor(
    private readonly fetchRssFeedService: FetchRssFeedService,
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
  ) {}

  // @Cron('0 0 */3 * * *')
  @Cron(getCronJobEveryXSeconds(60))
  @MeasureMethodAsync()
  async fetchAllRssCron() {
    this.logger.log('Fetching all RSS feeds');
    try {
      const feeds = await this.feedModel.find();

      let success = 0;
      const total = feeds.length;
      const bar = new ProgressBar(
        `Fetching ${feeds.length} rss feed [:bar] :percent | :current/:total documents | :etas`,
        {
          complete: '█',
          incomplete: ' ',
          width: 30,
          total: total,
          renderThrottle: 500,
          callback: (): void =>
            console.log(
              `Fetching rss feeds finished. Successful: ${success} | Failed: ${
                total - success
              }.`,
            ),
        },
      );

      for (const feed of feeds) {
        await this.fetchRssFeedService.fetchAndSaveRss(
          feed.url,
          null,
          feed.category,
        );
        success += 1;
        bar.tick();
      }
      this.logger.log('Successfully fetched all RSS feeds');
    } catch (error) {
      this.logger.error('Failed to fetch RSS feeds', error.stack);
    }
  }
}
