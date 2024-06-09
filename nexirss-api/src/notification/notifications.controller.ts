import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthUser } from '../auth/decorators/user.decorator';
import { User } from '../user/models/user.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  async subscribe(
    @Body() body: { endpoint: string; keys: { auth: string; p256dh: string } },
    @AuthUser() user: User,
  ) {
    const subscription = await this.notificationsService.subscribe(
      user._id,
      body,
    );
    return { message: 'Subscribed', subscription };
  }

  @Post()
  async sendNotification(
    @Body() body: { message: string },
    @AuthUser() user: User,
  ) {
    return this.notificationsService.sendNotification(
      { title: 'test', body: body.message },
      [user._id],
    );
  }

  @Get(':userId')
  async getNotifications(
    @Param('userId') userId: string,
    @AuthUser() user: User,
  ) {
    return this.notificationsService.getNotifications(user._id);
  }
}
