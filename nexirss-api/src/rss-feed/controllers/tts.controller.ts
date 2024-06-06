import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { TTSService } from '../services/tts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { User } from '../../user/models/user.schema';

@Controller('tts')
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateTTS(@Body('postId') postId: string, @AuthUser() user: User) {
    if (!user.openaiApiKey) {
      throw new BadRequestException('please setup the openaiApiKey!');
    }
    return this.ttsService.generateTTS(postId, user.openaiApiKey);
  }

  @Get(':id')
  async getTTS(@Param('id') id: string, @Res() res: Response) {
    return this.ttsService.getTTS(id, res);
  }
}
