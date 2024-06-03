import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { RssFeedService } from '../services/rss-feed.service';
import { Feed } from '../schemas/feed.schema';
import { RssItem } from '../schemas/rss-item.schema';
@Controller('rss-feed')
export class RssFeedController {
  constructor(private readonly rssFeedService: RssFeedService) {}

  @Post('fetch')
  async fetchRssFeed(
    @Body() body: { url: string; category: string; maxItems?: number },
  ): Promise<{ newItems: number; totalItems: number }> {
    return this.rssFeedService.fetchAndSaveRss(
      body.url,
      body.category,
      body?.maxItems,
    );
  }

  @Post('fetch-all')
  async fetchAllRssFeed() {
    return this.rssFeedService.fetchAndSaveAllRss();
  }

  @Post('vector-search')
  async vectorSearch(@Body('query') query: string): Promise<RssItem[]> {
    return this.rssFeedService.vectorSearch(query);
  }

  @Get('feeds')
  async getAllFeeds(): Promise<Feed[]> {
    return this.rssFeedService.getAllFeeds();
  }
  @Get('feeds/:feedId')
  async getFeedById(@Param('feedId') feedId: string): Promise<Feed> {
    return this.rssFeedService.getFeedById(feedId);
  }

  @Get('feeds/:feedId/items')
  async getFeedItems(@Param('feedId') feedId: string): Promise<RssItem[]> {
    return this.rssFeedService.getFeedItems(feedId);
  }

  @Get('items')
  async getItems(@Query('page') page: number, @Query('limit') limit: number) {
    return this.rssFeedService.getItems(page, limit);
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string): Promise<RssItem> {
    return this.rssFeedService.getItemById(id);
  }

  @Get('categories/:category/items')
  async getItemsByCategory(
    @Param('category') category: string,
  ): Promise<RssItem[]> {
    return this.rssFeedService.getItemsByCategory(category);
  }

  @Delete('feed')
  async deleteFeedByIdOrLink(
    @Body('identifier') identifier: string,
  ): Promise<{ deleted: boolean }> {
    return this.rssFeedService.deleteFeedByIdOrLink(identifier);
  }

  @Put('feed/:id')
  async updateFeedCategory(
    @Param('id') id: string,
    @Body('category') category: string,
  ): Promise<Feed> {
    return this.rssFeedService.updateFeedCategory(id, category);
  }
}
