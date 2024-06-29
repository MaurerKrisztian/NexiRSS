import { Injectable } from '@nestjs/common';
import { Feed } from '../../schemas/feed.schema';
import { Model } from 'mongoose';
import { ExportOmplService } from './export-ompl.service';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'bson';

@Injectable()
export class ExportFeedService {
  constructor(
    @InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
    private readonly exportOmplService: ExportOmplService,
  ) {}

  async exporOmpl(feedIds: string[]) {
    let query = {};
    if (feedIds && feedIds.length > 0) {
      const objectIds = feedIds.map((id) => new ObjectId(id));
      query = { _id: { $in: objectIds } };
    }

    const feeds = await this.feedModel.find(query).exec();

    const header = {
      title: 'NexiRSS Feeds',
      dateCreated: new Date(),
    };

    const outline = feeds.map((feed) => {
      return {
        text: feed.title,
        type: 'rss',
        xmlUrl: feed.url,
        category: feed.category,
      };
    });
    return this.exportOmplService.export(outline, header);
  }
}
