import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RssFeedService } from '../services/rss-feed.service';
import { Category, Feed } from '../schemas/feed.schema';
import { RssItem } from '../schemas/rss-item.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { User } from '../../user/models/user.schema';
import { FetchRssFeedService } from '../services/fetch-rss-feed.service';
@Controller('rss-feed')
@UseGuards(JwtAuthGuard)
export class RssFeedController {
  constructor(
    private readonly rssFeedService: RssFeedService,
    private readonly fetchRssFeedService: FetchRssFeedService,
  ) {}

  @Post('fetch')
  async fetchRssFeed(
    @Body() body: { url: string; category: Category; maxItems?: number },
    @AuthUser() user: User,
  ): Promise<{ newItems: number; totalItems: number }> {
    return this.fetchRssFeedService.fetchAndSaveRss(
      body.url,
      user?._id,
      body.category,
      body?.maxItems,
    );
  }

  @Post('fetch-all')
  async fetchAllRssFeed() {
    return this.rssFeedService.fetchAndSaveAllRss();
  }

  @Post('vector-search')
  async vectorSearch(
    @Body('query') query: string,
    @Body('category') category: string,
  ): Promise<RssItem[]> {
    return this.rssFeedService.vectorSearch(query, category);
  }

  @Get('feeds')
  async getFeeds(
    @Query('search') search: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ feeds: Feed[]; totalPages: number }> {
    return this.rssFeedService.getAllFeeds(search, page, limit);
  }

  @Get('feeds/:feedId')
  async getFeedById(@Param('feedId') feedId: string): Promise<Feed> {
    return this.rssFeedService.getFeedById(feedId);
  }

  @Get('feeds/:feedId/items')
  async getFeedItems(
    @Param('feedId') feedId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<RssItem[]> {
    return this.rssFeedService.getFeedItems(feedId, page, limit);
  }

  @Get('items')
  async getItems(@Query('page') page: number, @Query('limit') limit: number) {
    return this.rssFeedService.getItems(page, limit);
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string): Promise<RssItem> {
    return this.rssFeedService.getItemById(id);
  }

  @Get('items/:id/replay-event')
  async debugItemEvent(@Param('id') id: string): Promise<RssItem> {
    return this.rssFeedService.replayEvent(id);
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
    @Body('category') category: Category,
  ): Promise<Feed> {
    return this.rssFeedService.updateFeedCategory(id, category);
  }
}
