import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.schema';
import { Model } from 'mongoose';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { UserService } from '../user.service';
@Controller('ai-analytics')
@UseGuards(JwtAuthGuard)
export class AiAnalyticsController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
  ) {}

  @Post('setup-ai')
  async setupAiAnalytics(
    @AuthUser() user: User,
    @Body()
    body: { prompt: string; notifications: boolean; highlight: boolean },
  ) {
    const userId = user._id;
    return this.userService.addAiAnalyticsSetting(userId, body);
  }

  @Patch('update-ai/:id')
  async updateAiAnalytics(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body()
    body: { prompt: string; notifications: boolean; highlight: boolean },
  ) {
    const userId = user._id;
    return this.userService.updateAiAnalyticsSetting(userId, {
      _id: id,
      ...body,
    });
  }

  @Delete('delete-ai/:id')
  async deleteAiAnalytics(@AuthUser() user: User, @Param('id') id: string) {
    const userId = user._id;
    return this.userService.deleteAiAnalyticsSetting(userId, id);
  }
}
