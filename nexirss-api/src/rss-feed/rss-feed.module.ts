import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedService } from './services/rss-feed.service';
import { RssFeedController } from './controllers/rss-feed.controller';
import { RssItem, RssItemSchema } from './schemas/rss-item.schema';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RssItemListener } from './events/rss-item.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RssItem.name, schema: RssItemSchema },
      { name: Feed.name, schema: FeedSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  providers: [RssFeedService, RssItemListener],
  controllers: [RssFeedController],
})
export class RssFeedModule {}
