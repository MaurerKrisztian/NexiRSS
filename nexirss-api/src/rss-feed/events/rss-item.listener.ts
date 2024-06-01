import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../schemas/rss-item.schema';

@Injectable()
export class RssItemListener {
  @OnEvent('rss.item.new')
  handleNewRssItemEvent(rssItem: RssItem) {
    console.log('New RSS item added:', rssItem);
  }
}
