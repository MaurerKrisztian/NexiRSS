import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { TTSService } from '../services/tts.service';

@Controller('tts')
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post('generate')
  async generateTTS(@Body('postId') postId: string) {
    return this.ttsService.generateTTS(postId);
  }

  @Get(':id')
  async getTTS(@Param('id') id: string, @Res() res: Response) {
    return this.ttsService.getTTS(id, res);
  }
}
