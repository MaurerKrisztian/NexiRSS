import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedService } from './services/rss-feed.service';
import { RssFeedController } from './controllers/rss-feed.controller';
import { RssItem, RssItemSchema } from './schemas/rss-item.schema';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TTSService } from './services/tts.service';
import { TTSController } from './controllers/tts.controller';
import { RssFeedUserController } from './controllers/rss-feed-user.controller';
import { FeedNotificationService } from './services/feed-notification.service';
import { FetchRssFeedService } from './services/fetch-rss-feed.service';
import { FetchAllFeedsCronService } from './services/fetch-all-feeds-cron.service';
import { NotificationModule } from '../notification/notification.module';
import { NotificationsService } from '../notification/notifications.service';
import { ExportOmplService } from './services/import-export/export-ompl.service';
import { ExportFeedService } from './services/import-export/export-feed.service';
import { ImportFeedService } from './services/import-export/import-feed.service';
import { OmplParser } from './services/import-export/ompl-parser.service';
import { ImportExportController } from './controllers/import-export.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RssItem.name, schema: RssItemSchema },
      { name: Feed.name, schema: FeedSchema },
    ]),
    EventEmitterModule.forRoot(),
    NotificationModule,
  ],
  providers: [
    RssFeedService,
    ExportOmplService,
    ExportFeedService,
    TTSService,
    FeedNotificationService,
    FetchRssFeedService,
    FetchAllFeedsCronService,
    NotificationsService,
    ImportFeedService,
    OmplParser,
  ],
  controllers: [
    RssFeedController,
    RssFeedUserController,
    TTSController,
    ImportExportController,
  ],
  exports: [MongooseModule],
})
export class RssFeedModule {}
