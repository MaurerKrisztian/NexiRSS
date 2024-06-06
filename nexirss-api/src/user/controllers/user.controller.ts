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
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.schema';
import { Model } from 'mongoose';
import { AuthUser } from '../../auth/decorators/user.decorator';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  @Patch(':id')
  async updateFeedCategory(
    @Param('id') id: string,
    @Body() update: Partial<User>,
    @AuthUser() user: User,
  ) {
    return this.userModel.updateOne(
      { _id: user._id },
      { openaiApiKey: update.openaiApiKey },
    );
  }
}
