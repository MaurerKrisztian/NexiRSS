import { Controller, Get, Query } from '@nestjs/common';
import { OpenAiService } from '../services/openai.service';

@Controller('openai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @Get('chat')
  async chat(
    @Query('apiKey') apiKey: string,
    @Query('prompt') prompt: string,
    @Query('maxTokens') maxTokens: string,
  ) {
    const maxTokensNumber = parseInt(maxTokens || '2000', 10);
    return this.openAiService.createChatCompletion(
      apiKey,
      prompt,
      'gpt-3.5-turbo',
      maxTokensNumber,
    );
  }
}
