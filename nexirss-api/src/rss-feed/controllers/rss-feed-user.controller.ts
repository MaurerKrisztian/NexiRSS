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
import { Feed } from '../schemas/feed.schema';
import { RssItem } from '../schemas/rss-item.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { User } from '../../user/models/user.schema';
@Controller('rss-feed/user')
@UseGuards(JwtAuthGuard)
export class RssFeedUserController {
  constructor(private readonly rssFeedService: RssFeedService) {}

  @Post('fetch-all')
  async fetchAllRssFeed(@AuthUser() user: User) {
    return this.rssFeedService.fetchAndSaveAllRss(user.feeds);
  }

  @Post('vector-search')
  async vectorSearch(
    @Body('query') query: string,
    @Body('category') category: string,
    @AuthUser() user: User,
  ): Promise<RssItem[]> {
    return this.rssFeedService.vectorSearch(query, category, user.feeds);
  }

  @Get('feeds')
  async getAllFeeds(@AuthUser() user: User): Promise<Feed[]> {
    return this.rssFeedService.getFeedsByIds(user.feeds);
  }

  @Get('feeds/:feedId/items')
  async getFeedItems(@Param('feedId') feedId: string): Promise<RssItem[]> {
    return this.rssFeedService.getFeedItems(feedId);
  }

  @Get('items')
  async getItems(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @AuthUser() user: User,
  ) {
    return this.rssFeedService.getItems(page, limit, user.feeds);
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string): Promise<RssItem> {
    return this.rssFeedService.getItemById(id);
  }
}
