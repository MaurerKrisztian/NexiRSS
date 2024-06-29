import { Injectable } from '@nestjs/common';
import { OmplParser } from './ompl-parser.service';
import { FetchRssFeedService } from '../fetch-rss-feed.service';

@Injectable()
export class ImportFeedService {
  constructor(
    private readonly omplParser: OmplParser,
    private readonly fetchRssFeedService: FetchRssFeedService,
  ) {}

  async import(xmlString: string, userId?: string) {
    const parsedOmpl = await this.omplParser.parse(xmlString);
    for (const omplFeed of parsedOmpl) {
      await this.fetchRssFeedService.fetchAndSaveRss(
        omplFeed.xmlUrl,
        userId,
        undefined,
        25,
      );
    }
    return parsedOmpl;
  }
}
