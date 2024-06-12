import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { RssFeedService } from '../services/rss-feed.service';
import { Category, Feed } from '../schemas/feed.schema';
import { RssItem } from '../schemas/rss-item.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { User } from '../../user/models/user.schema';
import { UserService } from '../../user/user.service';
import { FetchRssFeedService } from '../services/fetch-rss-feed.service';
import { FetchAllFeedsCronService } from '../services/fetch-all-feeds-cron.service';
@Controller('rss-feed/:userId')
@UseGuards(JwtAuthGuard)
export class RssFeedUserController {
  constructor(
    private readonly rssFeedService: RssFeedService,
    private readonly userService: UserService,
    private readonly fetchRssFeedService: FetchRssFeedService,
    private readonly fetchAllFeedsCronService: FetchAllFeedsCronService,
  ) {}

  @Post('fetch-all')
  async fetchAllRssFeed(@AuthUser() user: User) {
    return this.rssFeedService.fetchAndSaveAllRss(user.feedSubscriptions);
  }

  @Post('add-feed')
  async addFeed(
    @Body() feedSubscription: { feedId: string; notifications?: boolean },
    @AuthUser() user: User,
  ) {
    return this.userService.addFeedToUser(
      user._id,
      feedSubscription.feedId,
      feedSubscription.notifications,
    );
  }

  @Patch('update-feed')
  async updateFeed(
    @Body() feedSubscription: { feedId: string; notifications?: boolean },
    @AuthUser() user: User,
  ) {
    return this.userService.updateFeedSubscription(
      user._id,
      feedSubscription.feedId,
      feedSubscription.notifications,
    );
  }
  @Delete('remove-feed')
  async removeFeed(@Body('feedId') feed: string, @AuthUser() user: User) {
    return this.userService.removeFeedFromUser(user._id, feed);
  }

  @Get('subscriptions')
  async getSubscription(@AuthUser() user: User) {
    return user.feedSubscriptions || [];
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
    @Query('category') category: Category,
    @Query('search') search: string,
    @AuthUser() user: User,
  ) {
    return this.rssFeedService.getItems(
      page,
      limit,
      user.feeds,
      category,
      search,
    );
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string): Promise<RssItem> {
    return this.rssFeedService.getItemById(id);
  }
}
